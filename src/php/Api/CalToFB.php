<?php
/**
 * Cal.eu to Meta pixel class file.
 *
 * @package Iwpdev\Antara\Api
 */

namespace Iwpdev\Antara\Api;

use FacebookAds\Api;
use FacebookAds\Object\ServerSide\Content;
use FacebookAds\Object\ServerSide\CustomData;
use FacebookAds\Object\ServerSide\Event;
use FacebookAds\Object\ServerSide\EventRequest;
use FacebookAds\Object\ServerSide\UserData;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;
use WP_Error;
use Throwable;

/**
 * Cal.eu to Meta pixel class.
 */
class CalToFB extends StripeToFB {

	/**
	 * REST API route for facebook conversions schedule.
	 *
	 * @var string
	 */
	const REST_ROUTE = '/facebook-conversions/schedule';

	/**
	 * Constructor.
	 */
	public function __construct() {
		parent::__construct();
	}

	/**
	 * Register REST API routes.
	 *
	 * @return void
	 */
	public function register_routes(): void {
		// Endpoint: /wp-json/v1/facebook-conversions/schedule
		register_rest_route(
			self::REST_NAMESPACE,
			self::REST_ROUTE,
			[
				'methods'             => [ WP_REST_Server::CREATABLE, WP_REST_Server::READABLE ],
				'callback'            => [ $this, 'handle_request' ],
				'permission_callback' => [ $this, 'check_permissions' ],
				'args'                => $this->get_endpoint_args(),
			]
		);
	}

	/**
	 * Handle incoming REST API request for Schedule event.
	 *
	 * @param WP_REST_Request $request REST request object.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function handle_request( WP_REST_Request $request ) {
		$params = $request->get_json_params();
		if ( empty( $params ) ) {
			$params = $request->get_params();
		}

		// Extract Cal.com / Cal.eu booking object from webhook payload
		$object = $this->extract_cal_object( $params );

		if ( empty( $object ) ) {
			return new WP_REST_Response(
				[
					'success' => false,
					'message' => 'Invalid or empty Cal payload received.',
				],
				400
			);
		}

		try {
			$access_token = defined( 'FB_APP_ID_CONSVERS' ) ? constant( 'FB_APP_ID_CONSVERS' ) : ( defined( 'FB_APP_ID_CONVERSION' ) ? constant( 'FB_APP_ID_CONVERSION' ) : ( defined( 'FB_APP_ID' ) ? constant( 'FB_APP_ID' ) : '' ) );
			if ( empty( $access_token ) ) {
				throw new \RuntimeException( 'Facebook API Access Token (FB_APP_ID_CONSVERS) is not configured.' );
			}

			$pixel_id = defined( 'FB_PIXEL_ID' ) ? constant( 'FB_PIXEL_ID' ) : self::DEFAULT_PIXEL_ID;

			Api::init( null, null, $access_token );

			// Extract test event code if provided in query/body or defined constant
			$raw_test_code = $request->get_param( 'test_event_code' );
			$test_code     = ! empty( $raw_test_code ) ? sanitize_text_field( wp_unslash( (string) $raw_test_code ) ) : ( defined( 'FB_TEST_EVENT_CODE' ) ? constant( 'FB_TEST_EVENT_CODE' ) : null );

			// 1. Prepare User Data
			$user_data = $this->build_user_data( $object );

			// 2. Prepare Custom Data & Content (Schedule)
			list( $custom_data, $booking_id, $amount, $currency ) = $this->build_custom_data( $object );

			// 3. Prepare Event (If testing or created timestamp is missing, use current time so FB Test Events displays it)
			$event_time = ! empty( $test_code ) ? time() : $this->extract_event_time( $object, $params );
			$event_url  = home_url( '/facebook-conversions/schedule' );

			$event = ( new Event() )
				->setEventName( 'Schedule' )
				->setEventTime( $event_time )
				->setEventId( $booking_id )
				->setEventSourceUrl( $event_url )
				->setUserData( $user_data )
				->setCustomData( $custom_data );

			// 4. Send Event Request
			$event_request = ( new EventRequest( $pixel_id ) )
				->setEvents( [ $event ] );

			if ( ! empty( $test_code ) ) {
				$event_request->setTestEventCode( (string) $test_code );
			}

			$fb_response = $event_request->execute();

			return new WP_REST_Response(
				[
					'success'         => true,
					'message'         => 'Schedule event successfully sent to Facebook Conversions API.',
					'pixel_id'        => $pixel_id,
					'test_event_code' => $test_code,
					'event_time'      => $event_time,
					'booking_id'      => $booking_id,
					'amount'          => $amount,
					'currency'        => $currency,
					'fb_response'     => $this->format_fb_response( $fb_response ),
				],
				200
			);
		} catch ( Throwable $e ) {
			if ( defined( 'WP_DEBUG_LOG' ) && WP_DEBUG_LOG ) {
				error_log( '[CalToFB Error] ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine() );
			}

			return new WP_REST_Response(
				[
					'success' => false,
					'message' => $e->getMessage(),
					'file'    => defined( 'WP_DEBUG' ) && WP_DEBUG ? $e->getFile() . ':' . $e->getLine() : null,
				],
				500
			);
		}
	}

	/**
	 * Extract Cal object from webhook payload.
	 *
	 * @param array $params
	 *
	 * @return array
	 */
	private function extract_cal_object( array $params ): array {
		if ( isset( $params['payload'] ) && is_array( $params['payload'] ) ) {
			return $params['payload'];
		}

		return $params;
	}

	/**
	 * Extract event timestamp.
	 *
	 * @param array $object
	 * @param array $params
	 *
	 * @return int
	 */
	private function extract_event_time( array $object, array $params ): int {
		$time_raw = $params['createdAt'] ?? ( $object['startTime'] ?? null );

		if ( ! empty( $time_raw ) ) {
			if ( is_numeric( $time_raw ) ) {
				return (int) $time_raw;
			}
			$time_str = sanitize_text_field( (string) $time_raw );
			$parsed   = strtotime( $time_str );
			if ( false !== $parsed && $parsed > 0 ) {
				return $parsed;
			}
		}

		return time();
	}

	/**
	 * Build UserData object for Facebook Conversions API.
	 *
	 * @param array $object Cal object.
	 *
	 * @return UserData
	 */
	private function build_user_data( array $object ): UserData {
		$user_data = new UserData();

		$attendee  = isset( $object['attendees'][0] ) && is_array( $object['attendees'][0] ) ? $object['attendees'][0] : [];
		$responses = isset( $object['responses'] ) && is_array( $object['responses'] ) ? $object['responses'] : [];

		// Email
		$raw_email = $attendee['email'] ?? ( is_array( $responses['email'] ?? null ) ? ( $responses['email']['value'] ?? '' ) : ( $responses['email'] ?? '' ) );
		$email     = sanitize_email( (string) $raw_email );
		if ( ! empty( $email ) && is_email( $email ) ) {
			$user_data->setEmail( strtolower( trim( $email ) ) );
		}

		// Phone
		$raw_phone = is_array( $responses['attendeePhoneNumber'] ?? null ) ? ( $responses['attendeePhoneNumber']['value'] ?? '' ) : ( $responses['attendeePhoneNumber'] ?? ( is_array( $responses['phone'] ?? null ) ? ( $responses['phone']['value'] ?? '' ) : ( $responses['phone'] ?? '' ) ) );
		$phone     = sanitize_text_field( (string) $raw_phone );
		if ( ! empty( $phone ) ) {
			$cleaned_phone = preg_replace( '/[^\d+]/', '', $phone );
			if ( ! empty( $cleaned_phone ) ) {
				$user_data->setPhone( $cleaned_phone );
			}
		}

		// First & Last name
		$first_name = isset( $attendee['firstName'] ) ? sanitize_text_field( (string) $attendee['firstName'] ) : '';
		$last_name  = isset( $attendee['lastName'] ) ? sanitize_text_field( (string) $attendee['lastName'] ) : '';

		if ( empty( $first_name ) && empty( $last_name ) ) {
			$raw_name  = $attendee['name'] ?? ( is_array( $responses['name'] ?? null ) ? ( $responses['name']['value'] ?? '' ) : ( $responses['name'] ?? '' ) );
			$full_name = sanitize_text_field( (string) $raw_name );
			if ( ! empty( $full_name ) ) {
				$name_parts = preg_split( '/\s+/', trim( $full_name ), 2 );
				$first_name = $name_parts[0] ?? '';
				$last_name  = $name_parts[1] ?? '';
			}
		}

		if ( ! empty( $first_name ) ) {
			$user_data->setFirstName( $first_name );
		}
		if ( ! empty( $last_name ) ) {
			$user_data->setLastName( $last_name );
		}

		return $user_data;
	}

	/**
	 * Build CustomData & Content objects for Schedule event.
	 *
	 * @param array $object Cal object.
	 *
	 * @return array [CustomData, string booking_id, float amount, string currency]
	 */
	private function build_custom_data( array $object ): array {
		// Price & Currency
		$amount   = isset( $object['price'] ) ? abs( floatval( $object['price'] ) ) : 0.0;
		$currency = ! empty( $object['currency'] ) ? sanitize_text_field( strtoupper( preg_replace( '/[^A-Za-z]/', '', (string) $object['currency'] ) ) ) : 'EUR';

		// Booking ID / Reference
		$booking_id_raw = ! empty( $object['uid'] ) ? (string) $object['uid'] : ( ! empty( $object['bookingId'] ) ? (string) $object['bookingId'] : ( 'BOOKING_' . time() ) );
		$booking_id     = sanitize_text_field( $booking_id_raw );

		// Event / Service details
		$title_raw     = ! empty( $object['title'] ) ? (string) $object['title'] : ( ! empty( $object['eventTitle'] ) ? (string) $object['eventTitle'] : ( ! empty( $object['type'] ) ? (string) $object['type'] : 'Schedule' ) );
		$title         = sanitize_text_field( wp_strip_all_tags( $title_raw ) );
		$event_type_id = ! empty( $object['eventTypeId'] ) ? sanitize_text_field( (string) $object['eventTypeId'] ) : $booking_id;
		$status        = ! empty( $object['status'] ) ? sanitize_text_field( (string) $object['status'] ) : 'ACCEPTED';

		$content = ( new Content() )
			->setProductId( $event_type_id )
			->setQuantity( 1 )
			->setItemPrice( $amount )
			->setTitle( $title )
			->setCategory( 'Appointment' );

		$custom_data = ( new CustomData() )
			->setContentType( 'service' )
			->setContentName( $title )
			->setContentCategory( 'Appointment' )
			->setContentIds( [ $event_type_id ] )
			->setContents( [ $content ] )
			->setOrderId( $booking_id )
			->setStatus( $status )
			->setNumItems( 1 );

		if ( $amount > 0 ) {
			$custom_data->setValue( $amount );
			$custom_data->setCurrency( $currency );
		}

		return [ $custom_data, $booking_id, $amount, $currency ];
	}
}
