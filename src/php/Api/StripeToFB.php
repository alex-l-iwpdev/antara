<?php
/**
 * Class StripeToFB
 *
 * REST API Endpoint handler for Stripe to Facebook Conversions.
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
 * StripeToFB REST API handler class.
 */
class StripeToFB {

	/**
	 * REST API namespace.
	 *
	 * @var string
	 */
	const REST_NAMESPACE = 'v1';

	/**
	 * Primary REST API route for facebook conversions payment.
	 *
	 * @var string
	 */
	const REST_ROUTE = '/facebook-conversions/payment';

	/**
	 * Default Facebook Pixel ID.
	 *
	 * @var string
	 */
	const DEFAULT_PIXEL_ID = '2103479450530794';

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'rest_api_init', [ $this, 'register_routes' ] );
	}

	/**
	 * Register REST API routes.
	 *
	 * @return void
	 */
	public function register_routes(): void {
		// Endpoint: /wp-json/v1/facebook-conversions/payment
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

		// Alias route with previous typo URL to prevent breaking incoming webhook configurations: /wp-json/v1/faceebook-conversions/payment
		register_rest_route(
			self::REST_NAMESPACE,
			'/faceebook-conversions/payment',
			[
				'methods'             => [ WP_REST_Server::CREATABLE, WP_REST_Server::READABLE ],
				'callback'            => [ $this, 'handle_request' ],
				'permission_callback' => [ $this, 'check_permissions' ],
				'args'                => $this->get_endpoint_args(),
			]
		);
	}

	/**
	 * Check permissions for the REST API request.
	 *
	 * @param WP_REST_Request $request REST request object.
	 *
	 * @return bool|WP_Error
	 */
	public function check_permissions( WP_REST_Request $request ) {
		// Webhook requests are public.
		return true;
	}

	/**
	 * Get arguments and schema for the endpoint.
	 *
	 * @return array
	 */
	public function get_endpoint_args(): array {
		return [];
	}

	/**
	 * Handle incoming REST API request.
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

		// Extract checkout session object from various Stripe webhook payload formats
		$object = $this->extract_stripe_object( $params );

		if ( empty( $object ) ) {
			return new WP_REST_Response(
				[
					'success' => false,
					'message' => 'Invalid or empty Stripe payload received.',
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

			// 1. Prepare User Data
			$user_data = $this->build_user_data( $object, $request );

			// 2. Prepare Custom Data & Content (Purchase)
			list( $custom_data, $order_id, $amount, $currency ) = $this->build_custom_data( $object );

			// 3. Prepare Event
			$event_time = ! empty( $object['created'] ) ? (int) $object['created'] : time();
			$event_url  = home_url( '/facebook-conversions/payment' );

			$event = ( new Event() )
				->setEventName( 'Purchase' )
				->setEventTime( $event_time )
				->setEventId( $order_id )
				->setEventSourceUrl( $event_url )
				->setUserData( $user_data )
				->setCustomData( $custom_data );

			// 4. Send Event Request
			$event_request = ( new EventRequest( $pixel_id ) )
				->setEvents( [ $event ] );

			// Support test event code if provided in query/body or defined constant
			$test_code = $request->get_param( 'test_event_code' ) ?: ( defined( 'FB_TEST_EVENT_CODE' ) ? constant( 'FB_TEST_EVENT_CODE' ) : null );
			if ( ! empty( $test_code ) ) {
				$event_request->setTestEventCode( (string) $test_code );
			}

			$fb_response = $event_request->execute();

			return new WP_REST_Response(
				[
					'success'     => true,
					'message'     => 'Purchase event successfully sent to Facebook Conversions API.',
					'order_id'    => $order_id,
					'amount'      => $amount,
					'currency'    => $currency,
					'fb_response' => $this->format_fb_response( $fb_response ),
				],
				200
			);
		} catch ( Throwable $e ) {
			if ( defined( 'WP_DEBUG_LOG' ) && WP_DEBUG_LOG ) {
				error_log( '[StripeToFB Error] ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine() );
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
	 * Extract Stripe object from webhook payload.
	 *
	 * @param array $params
	 *
	 * @return array
	 */
	private function extract_stripe_object( array $params ): array {
		if ( isset( $params['data']['object'] ) && is_array( $params['data']['object'] ) ) {
			return $params['data']['object'];
		}

		if ( isset( $params['object'] ) && is_array( $params['object'] ) ) {
			return $params['object'];
		}

		if ( isset( $params['id'] ) ) {
			return $params;
		}

		return [];
	}

	/**
	 * Build UserData object for Facebook Conversions API.
	 *
	 * @param array           $object  Stripe object.
	 * @param WP_REST_Request $request REST request object.
	 *
	 * @return UserData
	 */
	private function build_user_data( array $object, WP_REST_Request $request ): UserData {
		$user_data = new UserData();

		$customer_details = isset( $object['customer_details'] ) && is_array( $object['customer_details'] ) ? $object['customer_details'] : [];
		$address          = isset( $customer_details['address'] ) && is_array( $customer_details['address'] ) ? $customer_details['address'] : [];

		// Email
		$email = $customer_details['email'] ?? ( $object['customer_email'] ?? '' );
		if ( ! empty( $email ) ) {
			$user_data->setEmail( trim( (string) $email ) );
		}

		// Phone
		$phone = $customer_details['phone'] ?? '';
		if ( ! empty( $phone ) ) {
			$user_data->setPhone( trim( (string) $phone ) );
		}

		// Name / First & Last name
		$full_name = $customer_details['name'] ?? ( $customer_details['individual_name'] ?? ( $object['collected_information']['individual_name'] ?? '' ) );
		if ( ! empty( $full_name ) ) {
			$name_parts = preg_split( '/\s+/', trim( (string) $full_name ), 2 );
			if ( ! empty( $name_parts[0] ) ) {
				$user_data->setFirstName( $name_parts[0] );
			}
			if ( ! empty( $name_parts[1] ) ) {
				$user_data->setLastName( $name_parts[1] );
			}
		}

		// Address fields
		$country = $address['country'] ?? '';
		if ( ! empty( $country ) ) {
			$user_data->setCountryCode( strtolower( trim( (string) $country ) ) );
		}

		$city = $address['city'] ?? '';
		if ( ! empty( $city ) ) {
			$user_data->setCity( strtolower( trim( (string) $city ) ) );
		}

		$state = $address['state'] ?? '';
		if ( ! empty( $state ) ) {
			$user_data->setState( strtolower( trim( (string) $state ) ) );
		}

		$postal_code = $address['postal_code'] ?? '';
		if ( ! empty( $postal_code ) ) {
			$user_data->setZip( strtolower( trim( (string) $postal_code ) ) );
		}

		// Client IP and User Agent
		$client_ip = GeoIpApi::get_client_ip();
		if ( ! empty( $client_ip ) ) {
			$user_data->setClientIpAddress( $client_ip );
		}

		$user_agent = $request->get_header( 'user_agent' ) ?: ( $_SERVER['HTTP_USER_AGENT'] ?? '' );
		if ( ! empty( $user_agent ) ) {
			$user_data->setClientUserAgent( $user_agent );
		}

		return $user_data;
	}

	/**
	 * Build CustomData & Content objects.
	 *
	 * @param array $object Stripe object.
	 *
	 * @return array [CustomData, string order_id, float amount, string currency]
	 */
	private function build_custom_data( array $object ): array {
		// Calculate amount and currency
		$raw_amount = $object['amount_total'] ?? ( $object['amount_subtotal'] ?? ( $object['amount'] ?? 0 ) );
		$currency   = ! empty( $object['currency'] ) ? strtoupper( (string) $object['currency'] ) : 'EUR';

		// Stripe zero-decimal currencies
		$zero_decimal_currencies = [ 'BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF' ];
		if ( in_array( $currency, $zero_decimal_currencies, true ) ) {
			$amount = (float) $raw_amount;
		} else {
			$amount = round( (float) $raw_amount / 100, 2 );
		}

		// Order ID / Payment Reference
		$order_id = ! empty( $object['id'] ) ? (string) $object['id'] : ( ! empty( $object['payment_intent'] ) ? (string) $object['payment_intent'] : ( 'ORDER_' . time() ) );

		// Product identification
		$product_id = ! empty( $object['payment_link'] ) ? (string) $object['payment_link'] : ( ! empty( $object['payment_intent'] ) ? (string) $object['payment_intent'] : $order_id );
		$title      = ! empty( $object['metadata']['product_name'] ) ? (string) $object['metadata']['product_name'] : 'Payment';

		$content = ( new Content() )
			->setProductId( $product_id )
			->setQuantity( 1 )
			->setItemPrice( $amount )
			->setTitle( $title );

		$custom_data = ( new CustomData() )
			->setCurrency( $currency )
			->setValue( $amount )
			->setContentType( 'product' )
			->setContentIds( [ $product_id ] )
			->setContents( [ $content ] )
			->setOrderId( $order_id )
			->setNumItems( 1 );

		return [ $custom_data, $order_id, $amount, $currency ];
	}

	/**
	 * Format Facebook Conversions API response to array for JSON serialization.
	 *
	 * @param mixed $response Response from EventRequest::execute().
	 *
	 * @return array
	 */
	private function format_fb_response( $response ): array {
		if ( is_array( $response ) ) {
			return $response;
		}

		if ( is_object( $response ) ) {
			if ( method_exists( $response, 'getEventsReceived' ) ) {
				return [
					'events_received' => $response->getEventsReceived(),
					'messages'        => method_exists( $response, 'getMessages' ) ? $response->getMessages() : [],
					'fbtrace_id'      => method_exists( $response, 'getFbTraceId' ) ? $response->getFbTraceId() : null,
				];
			}

			if ( method_exists( $response, 'exportAllData' ) ) {
				return (array) $response->exportAllData();
			}

			if ( method_exists( $response, 'getData' ) ) {
				return (array) $response->getData();
			}

			return (array) $response;
		}

		return [ 'raw' => $response ];
	}
}
