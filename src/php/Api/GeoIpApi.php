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

	public function get_geo_info( $ip ) {
		$transient_key = 'geo_ip_' . md5( $ip );
		$cached_info   = get_transient( $transient_key );

		if ( false !== $cached_info ) {
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
		if ( is_wp_error( $response ) ) {
			return false;
		}
		$code = wp_remote_retrieve_response_code( $response );
		if ( 200 !== (int) $code ) {
			return false;
		}
		$body = wp_remote_retrieve_body( $response );
		if ( empty( $body ) ) {
			return false;
		}
		$data = json_decode( $body, true );
		if ( ! is_array( $data ) ) {
			return false;
		}

		$country_code = $data['country_code'] ?? false;

		if ( $country_code ) {
			set_transient( $transient_key, $country_code, DAY_IN_SECONDS );
		}

		// Return only the country_code value as requested.
		return $country_code;
	}
}
