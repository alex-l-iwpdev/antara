<?php
/**
 * Footer Contacts Element class file.
 */

namespace Iwpdev\Antara\Elements;

use Bricks\Element;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
} // Exit if accessed directly

/**
 * Footer Contacts Element class.
 */
class FooterContacts extends Element {
	public $category = 'general';
	public $name = 'footer-contacts';
	public $icon = 'ti-id-badge';

	/**
	 * Get the label of the element.
	 *
	 * @return array|string|string[]
	 */
	public function get_label() {
		return esc_html__( 'Footer Contacts', 'bricks' );
	}

	/**
	 * Get the keywords for the element.
	 *
	 * @return string[]
	 */
	public function get_keywords(): array {
		return [ 'footer', 'contact', 'links', 'social' ];
	}

	/**
	 * Set the controls available in the Bricks Customizer.
	 *
	 * @return void
	 */
	public function set_controls(): void {
		$this->controls['items'] = [
			'tab'           => 'content',
			'label'         => esc_html__( 'Contact Items', 'bricks' ),
			'type'          => 'repeater',
			'titleProperty' => 'label',
			'fields'        => [
				'label'     => [
					'label'       => esc_html__( 'Label', 'bricks' ),
					'type'        => 'text',
					'default'     => 'Instagram',
					'placeholder' => esc_html__( 'e.g. Instagram, hello@antara.be', 'bricks' ),
				],
				'link'      => [
					'label' => esc_html__( 'Link', 'bricks' ),
					'type'  => 'link',
				],
				'css_class' => [
					'label'       => esc_html__( 'Custom CSS Class', 'bricks' ),
					'type'        => 'text',
					'default'     => '',
					'placeholder' => 'footer-menu-link or footer-contact-link',
				],
			],
			'default'       => [
				[
					'label'     => 'Instagram',
					'link'      => [
						'url'    => 'https://www.instagram.com/antara.be',
						'type'   => 'external',
						'newTab' => true,
					],
					'css_class' => 'footer-menu-link',
				],
				[
					'label'     => 'Facebook',
					'link'      => [
						'url'    => 'https://www.facebook.com/people/Antarabe/100094033237452/',
						'type'   => 'external',
						'newTab' => true,
					],
					'css_class' => 'footer-menu-link',
				],
				[
					'label'     => 'hello@antara.be',
					'link'      => [ 'url' => 'mailto:hello@antara.be', 'type' => 'external' ],
					'css_class' => 'footer-menu-link',
				],
				[
					'label'     => '+32 491 52 65 12',
					'link'      => [ 'url' => 'tel:+32491526512', 'type' => 'external' ],
					'css_class' => 'footer-menu-link',
				],
			],
		];
	}

	/**
	 * Render the element.
	 *
	 * @return void
	 */
	public function render() {
		$settings = $this->settings;

		if ( empty( $settings['items'] ) ) {
			if ( bricks_is_builder_main() ) {
				echo esc_html__( 'Add contact items...', 'bricks' );
			}

			return;
		}

		$this->set_attribute( '_root', 'class', 'footer-menu-list' );

		echo '<div ' . $this->render_attributes( '_root' ) . '>';

		foreach ( $settings['items'] as $item ) {
			if ( empty( $item['label'] ) ) {
				continue;
			}

			$label     = $this->render_dynamic_data( $item['label'] );
			$link      = ! empty( $item['link'] ) ? $item['link'] : [];
			$css_class = ! empty( $item['css_class'] ) ? $item['css_class'] : 'footer-menu-link';

			echo '<div class="brxe-ewjegm brxe-div contacts-item">';

			if ( ! empty( $link['url'] ) ) {
				// We don't want to use set_link_attributes because it might add unwanted classes or IDs if not careful
				// but it is the standard way in Bricks.
				// To match the requested HTML exactly: <a class="brxe-ctsrko brxe-text-link footer-menu-link" href="..." target="_blank">

				$link_key = 'link-' . $item['_id'];
				$this->set_link_attributes( $link_key, $link );
				$this->set_attribute( $link_key, 'class', [ 'brxe-ctsrko', 'brxe-text-link', $css_class ] );

				echo '<a ' . $this->render_attributes( $link_key ) . '>' . $label . '</a>';
			} else {
				echo '<span class="brxe-ctsrko brxe-text-link ' . esc_attr( $css_class ) . '">' . $label . '</span>';
			}

			echo '</div>';
		}

		echo '</div>';
	}
}
