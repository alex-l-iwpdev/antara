<?php
/**
 * Class GeoIpApi
 *
 * This class is responsible for handling operations related to GeoIP API.
 * It provides methods to interact with GeoIP services, enabling functionalities
 * such as retrieving geographical information based on IP addresses.
 */

namespace Iwpdev\Antara\Api;

class GeoIpApi {
	const GEO_IP_API_URL = 'https://api.ipinfo.io/lite/';
	const GEO_IP_API_KEY = 'fb8aa1f6c1c3f1';

	/**
	 * Get client real IP address.
	 *
	 * @return string
	 */
	public static function get_client_ip(): string {
		// Allow test IP override for testing/debugging
		if ( ! empty( $_GET['geo_ip'] ) && filter_var( $_GET['geo_ip'], FILTER_VALIDATE_IP ) ) {
			return sanitize_text_field( wp_unslash( $_GET['geo_ip'] ) );
		}

		$ip_headers = [
			'HTTP_CF_CONNECTING_IP',
			'HTTP_X_FORWARDED_FOR',
			'HTTP_CLIENT_IP',
			'HTTP_X_REAL_IP',
			'HTTP_X_CLUSTER_CLIENT_IP',
			'HTTP_FORWARDED_FOR',
			'HTTP_FORWARDED',
			'REMOTE_ADDR',
		];

		$fallback_ip = '';

		foreach ( $ip_headers as $header ) {
			if ( ! empty( $_SERVER[ $header ] ) ) {
				$ip_list = explode( ',', $_SERVER[ $header ] );
				foreach ( $ip_list as $ip ) {
					$ip = trim( $ip );
					if ( filter_var( $ip, FILTER_VALIDATE_IP ) ) {
						// Prefer public IP address
						if ( filter_var( $ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE ) ) {
							return $ip;
						}
						if ( empty( $fallback_ip ) ) {
							$fallback_ip = $ip;
						}
					}
				}
			}
		}

		return ! empty( $fallback_ip ) ? $fallback_ip : ( $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1' );
	}

	/**
	 * Retrieve country code based on IP address.
	 *
	 * @param string $ip
	 * @return string|false
	 */
	public function get_country_by_ip( string $ip ) {
		if ( empty( $ip ) ) {
			return false;
		}

		// Cloudflare header support (instant 0ms resolution if proxied via Cloudflare)
		if ( ! empty( $_SERVER['HTTP_CF_IPCOUNTRY'] ) ) {
			$cf_country = strtoupper( trim( $_SERVER['HTTP_CF_IPCOUNTRY'] ) );
			if ( 2 === strlen( $cf_country ) && 'XX' !== $cf_country && 'T1' !== $cf_country ) {
				return $cf_country;
			}
		}

		// Check if IP is local/private/reserved
		if ( ! filter_var( $ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE ) ) {
			return false;
		}

		$transient_key = 'geo_ip_' . md5( $ip );
		$cached_info   = get_transient( $transient_key );

		if ( false !== $cached_info && ! empty( $cached_info ) ) {
			return $cached_info;
		}

		$apiUrl   = self::GEO_IP_API_URL . $ip . '?token=' . self::GEO_IP_API_KEY;
		$response = wp_remote_get(
			$apiUrl,
			[
				'timeout'     => 5,
				'redirection' => 2,
				'decompress'  => true,
				'headers'     => [
					'Accept'          => 'application/json',
					'Accept-Encoding' => 'gzip, deflate, br',
				],
			]
		);

		$body = '';
		if ( ! is_wp_error( $response ) && 200 === (int) wp_remote_retrieve_response_code( $response ) ) {
			$body = wp_remote_retrieve_body( $response );
		} elseif ( function_exists( 'curl_init' ) ) {
			// Fallback curl
			$ch = curl_init( $apiUrl );
			curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
			curl_setopt( $ch, CURLOPT_TIMEOUT, 5 );
			curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, false );
			$body = curl_exec( $ch );
		}

		if ( empty( $body ) ) {
			return false;
		}

		$data = json_decode( $body, true );
		if ( ! is_array( $data ) ) {
			return false;
		}

		$country_code = $data['country_code'] ?? $data['country'] ?? $data['countryCode'] ?? false;

		if ( $country_code && is_string( $country_code ) ) {
			$country_code = strtoupper( trim( $country_code ) );
			$expire       = defined( 'DAY_IN_SECONDS' ) ? constant( 'DAY_IN_SECONDS' ) : 86400;
			set_transient( $transient_key, $country_code, $expire );
			return $country_code;
		}

		return false;
	}

	/**
	 * Get geo info (checks manual user selection first if set, otherwise queries by IP).
	 *
	 * @param string $ip
	 * @param bool   $use_cookie
	 * @return string|false
	 */
	public function get_geo_info( $ip, bool $use_cookie = true ) {
		// If user has explicitly selected a location or has location cookie set, respect it
		if ( $use_cookie && ! empty( $_COOKIE['location'] ) ) {
			return filter_var( wp_unslash( $_COOKIE['location'] ), FILTER_SANITIZE_FULL_SPECIAL_CHARS );
		}

		// Detect country by IP
		$country = $this->get_country_by_ip( $ip );
		if ( $country ) {
			return $country;
		}

		return false;
	}

	/**
	 * Map detected country code to target language and location settings.
	 *
	 * @param string|false $country_code
	 * @return array
	 */
	public static function map_country_to_settings( $country_code ): array {
		$country = ! empty( $country_code ) ? strtoupper( trim( $country_code ) ) : '';

		// Default configuration (English, Belgium)
		$language      = 'en';
		$location      = 'be';
		$location_name = 'Keerbergen, Belgium';

		switch ( $country ) {
			case 'ES':
				$language      = 'es';
				$location      = 'es';
				$location_name = 'Barcelona, Spain';
				break;

			case 'NL':
				$language      = 'nl';
				$location      = 'be';
				$location_name = 'Keerbergen, Belgium';
				break;

			case 'FR':
				$language      = 'fr';
				$location      = 'be';
				$location_name = 'Keerbergen, Belgium';
				break;

			case 'BE':
				$location      = 'be';
				$location_name = 'Keerbergen, Belgium';
				// In Belgium, check browser accept language for French preference, otherwise default to Dutch
				$accept_lang = ! empty( $_SERVER['HTTP_ACCEPT_LANGUAGE'] ) ? strtolower( $_SERVER['HTTP_ACCEPT_LANGUAGE'] ) : '';
				if ( strpos( $accept_lang, 'fr' ) === 0 || strpos( $accept_lang, ',fr' ) !== false ) {
					$language = 'fr';
				} else {
					$language = 'nl';
				}
				break;

			default:
				$language      = 'en';
				$location      = 'be';
				$location_name = 'Keerbergen, Belgium';
				break;
		}

		return [
			'language'      => $language,
			'location'      => $location,
			'location_name' => $location_name,
		];
	}
}
