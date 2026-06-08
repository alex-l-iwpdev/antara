<?php
/**
 * Main theme class file.
 *
 * @package iwpdev/antara
 */

namespace Iwpdev\Antara;

use Bricks\Elements;
use Iwpdev\Antara\Api\GeoIpApi;
use Iwpdev\Antara\Modules\GeoContent;
use WP_Post;
use WP_HTML_Processor;

/**
 * Main theme class.
 */
class Main {
	/**
	 * Theme version.
	 */
	const THEME_VERSION = '1.2.17';

	/**
	 * Internal flag to avoid infinite loops while syncing WPML statuses.
	 * @var bool
	 */
	private $wpml_sync_in_progress = false;

	/**
	 * Internal flag to avoid infinite loops while syncing Polylang statuses.
	 * @var bool
	 */
	private $pll_sync_in_progress = false;

	/**
	 * Mail constructor.
	 */
	public function __construct() {
		$this->init();
	}

	/**
	 * Init Actions and Filters.
	 *
	 * @return void
	 */
	private function init(): void {
		new GeoContent();

		add_action( 'wp_enqueue_scripts', [ $this, 'register_scripts_and_styles' ] );

		// Register a dummy Klaviyo dependency early to avoid WP notice if plugin enqueues a script depending on it.
		add_action( 'wp_enqueue_scripts', [ $this, 'ensure_klaviyo_dependency' ], 1 );
		add_filter( 'wp_kses_allowed_html', [ $this, 'allow_custom_tags' ], 10, 2 );

		add_filter( 'upload_mimes', [ $this, 'add_mime_types' ] );

		add_filter( 'bricks/setup/control_options', [ $this, 'add_control_options' ] );
		add_action( 'init', [ $this, 'register_elements' ], 11 );

		add_action( 'add_meta_boxes', [ $this, 'add_mp3_meta_box' ] );

		add_action( 'save_post_product', [ $this, 'save_mp3_meta' ] );

		add_action( 'wp_footer', [ $this, 'print_video_assets_for_inline_script' ] );

		if ( class_exists( 'WooCommerce' ) ) {
			add_action( 'woocommerce_checkout_update_order_meta', [ $this, 'save_mp3_meta_woo' ] );
		}

		// When an EN page/post is moved to draft, also draft all its translations (WPML).
		add_action( 'transition_post_status', [ $this, 'sync_wpml_translations_to_draft' ], 10, 3 );
		// Do the same for Polylang translations.
		add_action( 'transition_post_status', [ $this, 'sync_pll_translations_to_draft' ], 10, 3 );

		add_action( 'admin_post_welcome_modal', [ 'Iwpdev\Antara\Main', 'welcome_modal_handler' ] );
		add_action( 'admin_post_nopriv_welcome_modal', [ 'Iwpdev\Antara\Main', 'welcome_modal_handler' ] );
		add_action( 'wp_ajax_welcome_modal', [ 'Iwpdev\Antara\Main', 'welcome_modal_handler' ] );
		add_action( 'wp_ajax_nopriv_welcome_modal', [ 'Iwpdev\Antara\Main', 'welcome_modal_handler' ] );
		add_action( 'wp_ajax_get_location', [ $this, 'get_location' ] );
		add_action( 'wp_ajax_nopriv_get_location', [ $this, 'get_location' ] );
		add_filter( 'gform_next_button', [ $this, 'input_to_button' ], 10, 2 );
		add_filter( 'gform_previous_button', [ $this, 'input_to_button' ], 10, 2 );
		add_filter( 'gform_submit_button', [ $this, 'gf_add_custom_css_classes'], 10, 2 );
		add_filter( 'gform_submit_button', [ $this, 'input_to_button' ], 10, 2 );
	}

	/**
	 * Update submit buttons to be HTML button elements.
	 *
	 * @param string $button Button markup
	 *
	 * @return string the modified markup
	 */
	public function input_to_button( $button, $form ) {
		$fragment = WP_HTML_Processor::create_fragment( $button );
		$fragment->next_token();

		$attributes = array( 'id', 'type', 'class', 'onclick' );
			$data_attributes = $fragment->get_attribute_names_with_prefix( 'data-' );
			if ( ! empty( $data_attributes ) ) {
					$attributes = array_merge( $attributes, $data_attributes );
			}

			$new_attributes = array();
			foreach ( $attributes as $attribute ) {
					$value = $fragment->get_attribute( $attribute );
					if ( ! empty( $value ) ) {
							$new_attributes[] = sprintf( '%s="%s"', $attribute, esc_attr( $value ) );
					}
			}

			return sprintf( '<div class="submit-button-wrapper"><button %s><i class="ti-email"></i><span>%s</span></button></div>', implode( ' ', $new_attributes ), esc_html( $fragment->get_attribute( 'value' ) ) );
	}

	/**
	 * Add custom CSS classes to the Gravity Forms submit button
	 *
	 * @param string $button Button markup
	 *
	 * @return string the updated HTML;
	 */
	public function gf_add_custom_css_classes( $button ) {
			$fragment = WP_HTML_Processor::create_fragment( $button );
			$fragment->next_token();

			$classes = [ 'bricks-button', 'bricks-background-primary', 'icon-left' ];

			foreach ( $classes as $class ) {
				$fragment->add_class( $class );
			}

			return $fragment->get_updated_html();
	}

	/**
	 * Add MP3 meta box.
	 *
	 * @return void
	 */
	public function add_mp3_meta_box(): void {
		add_meta_box(
				'custom_mp3_uploader',
				'MP3 Uploader',
				[ $this, 'render_custom_mp3_uploader' ],
				'product',
				'normal',
				'default',
		);
	}

	/**
	 * Save MP3 meta.
	 *
	 * @param $post_id
	 *
	 * @return void
	 */
	public function save_mp3_meta( $post_id ) {
		if ( defined( "DOING_AUTOSAVE" ) && DOING_AUTOSAVE ) {
			return;
		}

		if ( isset( $_POST["custom_mp3_url"] ) ) {
			$value = esc_url_raw( $_POST["custom_mp3_url"] );
			update_post_meta( $post_id, "my_music", $value );
		}
	}

	/**
	 * Render custom MP3 uploader.
	 *
	 * @param $post
	 *
	 * @return void
	 */
	function render_custom_mp3_uploader( $post ) {
		$mp3_url = get_post_meta( $post->ID, "my_music", true ); ?>
		<div>
			<p>
				<input
						type="text"
						id="custom_mp3_url"
						name="custom_mp3_url"
						value="<?php echo esc_attr( $mp3_url ); ?>" style="width: 100%;" readonly>
			</p>
			<p>
				<button type="button" class="button"
						id="upload_mp3_button"><?php esc_html_e( 'Select MP3', 'bricks' ); ?></button>
			</p>
		</div>
		<script>
			jQuery( document ).ready( function( $ ) {
				$( '#upload_mp3_button' ).on( 'click', function( e ) {
					e.preventDefault();
					const frame = wp.media( {
						title: 'Select MP3',
						multiple: false,
						library: {
							type: 'audio'
						},
						button: {
							text: 'Select'
						}
					} );
					frame.on( 'select', function() {
						const attachment = frame.state().get( 'selection' ).first().toJSON();
						$( '#custom_mp3_url' ).val( attachment.url );
					} );
					frame.open();
				} );
			} );
		</script>
		<?php
	}

	/**
	 * Register Bricks elements.
	 *
	 * @return void
	 */
	public function register_elements() {
		if ( ! class_exists( '\Bricks\Elements' ) ) {
			return;
		}

		$custom_elements = [
				__DIR__ . '/Elements/FooterContacts.php',
				__DIR__ . '/Elements/WelcomeModal.php',
		];

		foreach ( $custom_elements as $file ) {
			if ( file_exists( $file ) ) {
				Elements::register_element( $file );
			}
		}
	}

	/**
	 * Add custom control options.
	 *
	 * @param array $control_options
	 *
	 * @return array
	 */
	public function add_control_options( $control_options ) {
		// Add any custom control options here if needed
		return $control_options;
	}

	/**
	 * Register scripts and styles.
	 *
	 * @return void
	 */
	public function register_scripts_and_styles(): void {

		if ( bricks_is_builder_main() ) {
			return;
		}

		wp_enqueue_script(
				'bricks-child-app',
				get_stylesheet_directory_uri() . '/assets/js/app.js',
				[
						'jquery',
						'bricks-scripts',
				],
				self::THEME_VERSION,
				true
		);

		wp_localize_script(
				'bricks-child-app',
				'appData',
				[
						'ajaxUrl'   => admin_url( 'admin-ajax.php' ),
						'actionGeo' => GeoContent::GEO_CONTENT_ACTION_AND_NONCE,
						'nonceGeo'  => wp_create_nonce( GeoContent::GEO_CONTENT_ACTION_AND_NONCE ),
				]
		);

		wp_enqueue_style( 'bricks-child-style', get_stylesheet_directory_uri() . '/assets/css/app.css', [ 'bricks-frontend' ] );
	}

	/**
	 * @param $mimes
	 *
	 * @return mixed
	 */
	public function add_mime_types( array $mimes ) {
		$mimes['svg'] = 'image/svg+xml';

		return $mimes;
	}

	/**
	 * Ensure the Klaviyo dependency handle exists to satisfy plugin dependencies
	 * without actually loading a script if the plugin forgot to register it.
	 */
	public function ensure_klaviyo_dependency(): void {
		if ( ! wp_script_is( 'klaviyojs', 'registered' ) ) {
			// Register a no-op handle so dependent scripts can be enqueued without notice
			wp_register_script( 'klaviyojs', false, [], null );
		}
	}

	/**
	 * Print video assets for an inline script
	 *
	 * @return void
	 */
	public function print_video_assets_for_inline_script() {
		$video_data = [
				"desktop_video"  => content_url( "/uploads/2025/04/16-9-web-loop_OK.mp4" ),
				"mobile_video"   => content_url( "/uploads/2025/04/4-5-web-loop_OK-.mp4" ),
				"desktop_poster" => content_url( "/uploads/2025/04/Background.avif" ),
				"mobile_poster"  => content_url( "/uploads/2025/04/bgmob.avif" ),
		];

		// 2. Displaying the data on the page inside the <script>tag
		// json_encode turns a PHP array into a secure JSON object for JS
		?>
		<script id="video-assets-data">
			const videoAssets = <?php echo json_encode( $video_data ); ?>;
		</script>
		<?php
	}

	public function allow_custom_tags( $tags, $context ) {
		if ( 'post' === $context ) {
			$tags['svg']      = [
					'xmlns'           => true,
					'viewbox'         => true,
					'width'           => true,
					'height'          => true,
					'fill'            => true,
					'stroke'          => true,
					'stroke-width'    => true,
					'stroke-linecap'  => true,
					'stroke-linejoin' => true,
					'class'           => true,
					'style'           => true,
					'aria-hidden'     => true,
					'role'            => true,
					'focusable'       => true,
			];
			$tags['path']     = [
					'd'               => true,
					'fill'            => true,
					'stroke'          => true,
					'stroke-width'    => true,
					'stroke-linecap'  => true,
					'stroke-linejoin' => true,
			];
			$tags['circle']   = [
					'cx'              => true,
					'cy'              => true,
					'r'               => true,
					'fill'            => true,
					'stroke'          => true,
					'stroke-width'    => true,
					'stroke-linecap'  => true,
					'stroke-linejoin' => true,
			];
			$tags['rect']     = [
					'x'               => true,
					'y'               => true,
					'width'           => true,
					'height'          => true,
					'fill'            => true,
					'stroke'          => true,
					'stroke-width'    => true,
					'stroke-linecap'  => true,
					'stroke-linejoin' => true,
			];
			$tags['polygon']  = [
					'points'          => true,
					'fill'            => true,
					'stroke'          => true,
					'stroke-width'    => true,
					'stroke-linecap'  => true,
					'stroke-linejoin' => true,
			];
			$tags['polyline'] = [
					'points'          => true,
					'fill'            => true,
					'stroke'          => true,
					'stroke-width'    => true,
					'stroke-linecap'  => true,
					'stroke-linejoin' => true,
			];
			$tags['line']     = [
					'x1'              => true,
					'y1'              => true,
					'x2'              => true,
					'y2'              => true,
					'fill'            => true,
					'stroke'          => true,
					'stroke-width'    => true,
					'stroke-linecap'  => true,
					'stroke-linejoin' => true,
			];
			$tags['g']        = [
					'fill'            => true,
					'stroke'          => true,
					'stroke-width'    => true,
					'stroke-linecap'  => true,
					'stroke-linejoin' => true,
			];
			$tags['defs']     = [];
			$tags['title']    = [];
			$tags['desc']     = [];
			$tags['style']    = [];
			$tags['use']      = [
					'xlink:href' => true,
					'href'       => true, // For modern SVG use
			];
		}

		return $tags;
	}

	/**
	 * Save meta data for gift cards
	 *
	 * @param $order_id
	 *
	 * @return void
	 */
	public function save_mp3_meta_woo( $order_id ): void {
		$order = wc_get_order( $order_id );
		foreach ( $order->get_items() as $item ) {
			$product = $item->get_product();
			if ( ! $product ) {
				continue;
			}

			if ( has_term( 'gift-cards', 'product_cat', $product->get_id() ) ) {
				$order->update_meta_data( 'is_gift_card_order', 'yes' );
				$order->save();
				break;
			}
		}
	}

	/**
	 * If an English version of a page or post is moved to draft, automatically
	 * set all its WPML translations to draft as well.
	 *
	 * @param string  $new_status New Status.
	 * @param string  $old_status Old Status.
	 * @param WP_Post $post       Post Object.
	 *
	 * @return void
	 */
	public function sync_wpml_translations_to_draft( $new_status, $old_status, $post ): void {
		// Avoid recursion
		if ( $this->wpml_sync_in_progress ) {
			return;
		}

		// Only act when switching to draft from a different status
		if ( 'draft' !== $new_status || 'draft' === $old_status ) {
			return;
		}

		if ( ! $post instanceof WP_Post ) {
			return;
		}

		// Ignore autosaves and revisions
		if ( wp_is_post_autosave( $post->ID ) || wp_is_post_revision( $post->ID ) ) {
			return;
		}

		$post_type = get_post_type( $post );
		// Only for standard posts/pages as requested
		if ( ! in_array( $post_type, [ 'post', 'page' ], true ) ) {
			return;
		}

		// Ensure WPML is active enough to provide language info
		if ( ! function_exists( 'apply_filters' ) ) {
			return;
		}

		// Detect the language of the current post
		$lang_details = apply_filters( 'wpml_post_language_details', null, $post->ID );
		$lang_code    = ( is_array( $lang_details ) && isset( $lang_details['language_code'] ) ) ? $lang_details['language_code'] : null;

		// Only trigger when the source is English
		if ( 'en' !== $lang_code ) {
			return;
		}

		$element_type = 'post_' . $post_type;
		$trid         = apply_filters( 'wpml_element_trid', null, $post->ID, $element_type );
		if ( empty( $trid ) ) {
			return;
		}

		$translations = apply_filters( 'wpml_get_element_translations', null, $trid, $element_type );
		if ( empty( $translations ) || ! is_array( $translations ) ) {
			return;
		}

		$this->wpml_sync_in_progress = true;
		foreach ( $translations as $translation ) {
			if ( empty( $translation->element_id ) ) {
				continue;
			}

			$translated_post_id = (int) $translation->element_id;
			if ( $translated_post_id === (int) $post->ID ) {
				continue; // Skip the original EN post
			}

			$current_status = get_post_status( $translated_post_id );
			if ( 'draft' !== $current_status ) {
				wp_update_post( [
						'ID'          => $translated_post_id,
						'post_status' => 'draft',
				] );
			}
		}
		$this->wpml_sync_in_progress = false;
	}

	/**
	 * If the English version of the page/post is translated into a draft —
	 * to draft all its translations (Polylang).
	 *
	 * @param string  $new_status New status.
	 * @param string  $old_status Old status.
	 * @param WP_Post $post       Record Object.
	 *
	 * @return void
	 */
	public function sync_pll_translations_to_draft( $new_status, $old_status, $post ): void {
		// Избегаем рекурсии
		if ( $this->pll_sync_in_progress ) {
			return;
		}

		// Реагируем только на переход в статус draft из иного статуса
		if ( 'draft' !== $new_status || 'draft' === $old_status ) {
			return;
		}

		if ( ! $post instanceof WP_Post ) {
			return;
		}

		// Игнорируем автосохранения и ревизии
		if ( wp_is_post_autosave( $post->ID ) || wp_is_post_revision( $post->ID ) ) {
			return;
		}

		$post_type = get_post_type( $post );
		// Только для стандартных типов записей, как и в WPML-версии
		if ( ! in_array( $post_type, [ 'post', 'page' ], true ) ) {
			return;
		}

		// Убедимся, что Polylang активен
		if ( ! function_exists( 'pll_get_post_language' ) || ! function_exists( 'pll_get_post_translations' ) ) {
			return;
		}

		// Определяем язык исходной записи
		$lang = pll_get_post_language( $post->ID, 'slug' );
		if ( 'en' !== $lang ) {
			return; // Срабатываем только для английского источника
		}

		$translations = pll_get_post_translations( $post->ID ); // [ lang => post_id ]
		if ( empty( $translations ) || ! is_array( $translations ) ) {
			return;
		}

		$this->pll_sync_in_progress = true;
		foreach ( $translations as $lang_code => $translated_post_id ) {
			$translated_post_id = (int) $translated_post_id;
			if ( $translated_post_id === (int) $post->ID ) {
				continue; // Пропускаем исходную EN-запись
			}

			$current_status = get_post_status( $translated_post_id );
			if ( 'draft' !== $current_status ) {
				wp_update_post( [
						'ID'          => $translated_post_id,
						'post_status' => 'draft',
				] );
			}
		}
		$this->pll_sync_in_progress = false;
	}

	/**
	 * Welcome modal handler.
	 *
	 * @return void
	 */
	public static function welcome_modal_handler(): void {

		// Verify nonce
		if ( ! isset( $_POST['welcome_nonce'] ) || ! wp_verify_nonce( $_POST['welcome_nonce'], 'welcome_modal' ) ) {
			wp_die( 'Security check failed' );
		}

		$location = isset( $_POST['location'] ) ? sanitize_text_field( $_POST['location'] ) : '';
		$language = isset( $_POST['language'] ) ? sanitize_text_field( $_POST['language'] ) : '';

		// Map lag_ prefixes to actual Polylang language codes if necessary
		$pll_lang = str_replace( 'lag_', '', $language );

		// Set cookies (expire in 1 week)
		$expire = time() + ( 7 * 24 * 60 * 60 );
		setcookie( 'welcome-modal', 'true', $expire, COOKIEPATH, COOKIE_DOMAIN );
		setcookie( 'pll_language', $pll_lang, $expire, COOKIEPATH, COOKIE_DOMAIN );
		setcookie( 'location', $location, $expire, COOKIEPATH, COOKIE_DOMAIN );

		// Also set location_name if we can find it
		$locations = [
			'es' => 'Barcelona, Spain',
			'be' => 'Keerbergen, Belgium',
		];
		if ( isset( $locations[ $location ] ) ) {
			setcookie( 'location_name', $locations[ $location ], $expire, COOKIEPATH, COOKIE_DOMAIN );
		}

		// Prevent caching
		nocache_headers();
		header( 'Cache-Control: no-cache, must-revalidate, max-age=0' );
		header( 'Expires: Wed, 11 Jan 1984 05:00:00 GMT' );
		header( 'Pragma: no-cache' );

		// Redirect to home page of the selected language
		$redirect_url = home_url( '/' );
		if ( function_exists( 'pll_home_url' ) ) {
			$redirect_url = pll_home_url( $pll_lang );
		}

		// Try to redirect to the translated version of the current page
		$referer = wp_get_referer();
		if ( $referer ) {
			$post_id = url_to_postid( $referer );
			if ( $post_id && function_exists( 'pll_get_post' ) ) {
				$translated_post_id = pll_get_post( $post_id, $pll_lang );
				if ( $translated_post_id ) {
					$redirect_url = get_permalink( $translated_post_id );
				}
			}
		}

		// If AJAX, return JSON
		if ( wp_doing_ajax() ) {
			wp_send_json_success( [ 'redirect_url' => $redirect_url ] );
		}

		wp_safe_redirect( $redirect_url, 302 );
		echo '<script type="text/javascript">window.location.href="' . esc_url( $redirect_url ) . '";</script>';
		echo '<noscript><meta http-equiv="refresh" content="0;url=' . esc_url( $redirect_url ) . '"></noscript>';
		die();
	}

	/**
	 * Get location Ajax.
	 *
	 * @return void
	 */
	public function get_location(): void {

		if ( ! empty( $_COOKIE['location'] ) ) {
			$country = $_COOKIE['location'];
		} else {

			$geo_api = new GeoIpApi();
			$ip      = $_SERVER['REMOTE_ADDR'] ?? $_SERVER['HTTP_X_REAL_IP'];
			if ( isset( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) {
				$ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
			}
			$country = $geo_api->get_geo_info( $ip );
		}


		switch ( $country ) {
			case 'es':
				wp_send_json_success( [ 'location' => __( 'Barcelona, Spain', '' ) ] );
				break;
			default:
				wp_send_json_success( [ 'location' => __( 'Keerbergen, Belgium', '' ) ] );
		}
	}


}
