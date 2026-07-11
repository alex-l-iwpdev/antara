<?php
/**
 * Main theme class file.
 *
 * @package iwpdev/antara
 */

namespace Iwpdev\Antara;

use Bricks\Elements;
use WP_Post;

/**
 * Main theme class.
 */
class Main {
	/**
	 * Theme version.
	 */
	const THEME_VERSION = '1.0.7';

	/**
	 * Internal flag to avoid infinite loops while syncing WPML statuses.
	 * @var bool
	 */
	private $wpml_sync_in_progress = false;

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

		// Fix WPML language switcher URLs for Shop page when it is set as front page
		add_filter( 'wpml_ls_filter_links', [ $this, 'fix_wpml_shop_front_page_urls' ], 10, 1 );
		// Intercept URL generation per language in LS model
		add_filter( 'wpml_ls_language_url', [ $this, 'fix_wpml_shop_front_page_language_url' ], 10, 2 );
		// Also post-process final LS HTML to catch legacy/shortcode outputs
		add_filter( 'wpml_ls_html', [ $this, 'fix_wpml_shop_front_page_ls_html' ], 10, 3 );
		// Fix hreflang tags
		add_filter( 'wpml_alternate_hreflang', [ $this, 'fix_wpml_shop_front_page_hreflang' ], 10, 2 );
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
	 * Fix WPML language switcher URLs when the Shop page is set as the Front Page.
	 * Some languages translate the shop slug (e.g. "/winkel/") so we must detect
	 * the actual translated Shop page URL per language and replace it with the
	 * language home URL.
	 *
	 * @param array $links The language switcher links.
	 * @return array
	 */
	public function fix_wpml_shop_front_page_urls( $links ) {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return $links;
		}

		$shop_page_id  = wc_get_page_id( 'shop' );
		$front_page_id = (int) get_option( 'page_on_front' );

		// Only act if the shop page is the front page
		if ( $shop_page_id <= 0 || $shop_page_id !== $front_page_id ) {
			return $links;
		}

		foreach ( $links as $lang_code => &$link ) {
			if ( empty( $link['url'] ) ) {
				continue;
			}

			// Try robust, language-aware comparison using the translated Shop page URL
			$lang = isset( $link['code'] ) ? $link['code'] : ( is_string( $lang_code ) ? $lang_code : null );
			if ( $lang ) {
				$translated_shop_id = apply_filters( 'wpml_object_id', $shop_page_id, 'page', true, $lang );
				if ( $translated_shop_id ) {
					$translated_shop_url = trailingslashit( get_permalink( $translated_shop_id ) );
					$current_url         = trailingslashit( $link['url'] );

					if ( $current_url === $translated_shop_url ) {
						$home_lang_url = trailingslashit( apply_filters( 'wpml_home_url', get_home_url(), $lang ) );
						$link['url']   = $home_lang_url;
						continue;
					}
				}
			}

			// Fallback: generic replacement for "/shop/" patterns
			if ( strpos( $link['url'], '/shop/' ) !== false ) {
				$link['url'] = str_replace( '/shop/', '/', $link['url'] );
			} elseif ( substr( $link['url'], -5 ) === '/shop' ) {
				$link['url'] = substr( $link['url'], 0, -4 );
			}
		}

		return $links;
	}

	/**
	 * Fix hreflang tags for the Shop page when it's set as the Front Page.
	 * Handle translated shop slugs per language (e.g. "/winkel/") and point to
	 * the language home URL instead.
	 *
	 * @param string $url  The hreflang URL.
	 * @param string $lang The language code.
	 * @return string
	 */
	public function fix_wpml_shop_front_page_hreflang( $url, $lang ) {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return $url;
		}

		$shop_page_id  = wc_get_page_id( 'shop' );
		$front_page_id = (int) get_option( 'page_on_front' );

		if ( $shop_page_id <= 0 || $shop_page_id !== $front_page_id ) {
			return $url;
		}

		// Compare against the translated Shop page permalink for this language
		$translated_shop_id = apply_filters( 'wpml_object_id', $shop_page_id, 'page', true, $lang );
		if ( $translated_shop_id ) {
			$translated_shop_url = trailingslashit( get_permalink( $translated_shop_id ) );
			$current_url         = trailingslashit( $url );

			if ( $current_url === $translated_shop_url ) {
				return trailingslashit( apply_filters( 'wpml_home_url', get_home_url(), $lang ) );
			}
		}

		// Fallback: generic "/shop/" replacements
		if ( strpos( $url, '/shop/' ) !== false ) {
			return str_replace( '/shop/', '/', $url );
		} elseif ( substr( $url, -5 ) === '/shop' ) {
			return substr( $url, 0, -4 );
		}

		return $url;
	}

	/**
	 * Post-process WPML Language Switcher final HTML (legacy/shortcode outputs)
	 * to replace links to the translated Shop page with the language root when
	 * the Shop page is set as Front Page.
	 *
	 * @param string       $html  Final LS HTML
	 * @param array        $model Model used to render (contains languages)
	 * @param WPML_LS_Slot $slot  Slot configuration
	 * @return string
	 */
	public function fix_wpml_shop_front_page_ls_html( $html, $model, $slot ) {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return $html;
		}

		$shop_page_id  = wc_get_page_id( 'shop' );
		$front_page_id = (int) get_option( 'page_on_front' );
		if ( $shop_page_id <= 0 || $shop_page_id !== $front_page_id ) {
			return $html;
		}

		// Build a map of "shop URL in language" => "home URL in language"
		$replacements = [];
		if ( isset( $model['languages'] ) && is_array( $model['languages'] ) ) {
			foreach ( $model['languages'] as $lang ) {
				if ( empty( $lang['code'] ) ) {
					continue;
				}
				$code = $lang['code'];
				$translated_shop_id = apply_filters( 'wpml_object_id', $shop_page_id, 'page', true, $code );
				if ( $translated_shop_id ) {
					$shop_url  = trailingslashit( get_permalink( $translated_shop_id ) );
					$home_url  = trailingslashit( apply_filters( 'wpml_home_url', get_home_url(), $code ) );
					$replacements[ $shop_url ] = $home_url;
					// Also consider non-trailing slash variant just in case
					$replacements[ untrailingslashit( $shop_url ) ] = untrailingslashit( $home_url );
				}

				// Fallback for explicit "/shop/" in that language's link (rare if slug translated)
				if ( ! empty( $lang['url'] ) && strpos( $lang['url'], '/shop/' ) !== false ) {
					$replacements[ '/shop/' ] = '/';
				}
			}
		}

		if ( empty( $replacements ) ) {
			return $html;
		}

		// Replace only inside href attributes to be safer
		foreach ( $replacements as $from => $to ) {
			// Exact href="from"
			$html = str_replace( 'href="' . esc_url( $from ) . '"', 'href="' . esc_url( $to ) . '"', $html );
			// Non-escaped variant just in case
			$html = str_replace( 'href="' . $from . '"', 'href="' . $to . '"', $html );
		}

		return $html;
	}

	/**
	 * Intercept per-language URL during LS model build and normalize Shop->Home
	 * when Shop is set as the Front Page.
	 *
	 * @param string $url  Current language URL produced by WPML
	 * @param array  $data Language data from WPML model (should include code/url)
	 * @return string
	 */
	public function fix_wpml_shop_front_page_language_url( $url, $data ) {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return $url;
		}

		$shop_page_id = wc_get_page_id( 'shop' );
		if ( $shop_page_id <= 0 ) {
			return $url;
		}

		// Determine language code
		$lang = null;
		if ( is_array( $data ) ) {
			if ( ! empty( $data['language_code'] ) ) {
				$lang = $data['language_code'];
			} elseif ( ! empty( $data['code'] ) ) {
				$lang = $data['code'];
			}
		}

		if ( ! $lang ) {
			return $url;
		}

		$translated_shop_id = apply_filters( 'wpml_object_id', $shop_page_id, 'page', true, $lang );
		if ( $translated_shop_id ) {
			$translated_shop_url = trailingslashit( get_permalink( $translated_shop_id ) );
			$current_url        = trailingslashit( $url );

			if ( $current_url === $translated_shop_url ) {
				return trailingslashit( apply_filters( 'wpml_home_url', get_home_url(), $lang ) );
			}
		}

		// Fallback for explicit "/shop/" patterns
		if ( strpos( $url, '/shop/' ) !== false ) {
			return str_replace( '/shop/', '/', $url );
		}
		if ( substr( $url, -5 ) === '/shop' ) {
			return substr( $url, 0, -4 );
		}

		return $url;
	}

}
