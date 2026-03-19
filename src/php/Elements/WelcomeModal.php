<?php

namespace Iwpdev\Antara\Elements;

use Bricks\Element;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
} // Exit if accessed directly

/**
 * Welcome Modal Element class.
 */
class WelcomeModal extends Element {
	public $category = 'general';
	public $name = 'welcome-modal';
	public $icon = 'ti-layout-modal-window'; // Standard icon for modals

	/**
	 * Get the label of the element.
	 *
	 * @return array|string|string[]
	 */
	public function get_label() {
		return esc_html__( 'Welcome Modal', 'bricks' );
	}

	/**
	 * Get the keywords for the element.
	 *
	 * @return string[]
	 */
	public function get_keywords(): array {
		return [ 'welcome', 'modal', 'language', 'location' ];
	}

	/**
	 * Set the controls available in the Bricks Customizer.
	 *
	 * @return void
	 */
	public function set_controls(): void {
		$this->controls['title'] = [
			'tab'     => 'content',
			'label'   => esc_html__( 'Title', 'bricks' ),
			'type'    => 'text',
			'default' => 'Welcome to Antara',
		];

		$this->controls['locationTitle'] = [
			'tab'     => 'content',
			'label'   => esc_html__( 'Location Question', 'bricks' ),
			'type'    => 'text',
			'default' => 'Where would you like to attend your session?',
		];

		$this->controls['locations'] = [
			'tab'           => 'content',
			'label'         => esc_html__( 'Locations', 'bricks' ),
			'type'          => 'repeater',
			'titleProperty' => 'label',
			'fields'        => [
				'label' => [
					'label' => esc_html__( 'Label', 'bricks' ),
					'type'  => 'text',
				],
				'id'    => [
					'label'       => esc_html__( 'ID', 'bricks' ),
					'type'        => 'text',
					'description' => esc_html__( 'Unique ID for radio input', 'bricks' ),
				],
			],
			'default'       => [
				[
					'label' => 'Barcelona, Spain',
					'id'    => 'es',
				],
				[
					'label' => 'Keerbergen, Belgium',
					'id'    => 'be',
				],
			],
		];

		$this->controls['languageTitle'] = [
			'tab'     => 'content',
			'label'   => esc_html__( 'Language Question', 'bricks' ),
			'type'    => 'text',
			'default' => 'Choose your language:',
		];

		$this->controls['languages'] = [
			'tab'           => 'content',
			'label'         => esc_html__( 'Languages', 'bricks' ),
			'type'          => 'repeater',
			'titleProperty' => 'label',
			'fields'        => [
				'label' => [
					'label' => esc_html__( 'Label', 'bricks' ),
					'type'  => 'text',
				],
				'id'    => [
					'label'       => esc_html__( 'ID', 'bricks' ),
					'type'        => 'text',
					'description' => esc_html__( 'Unique ID for radio input', 'bricks' ),
				],
			],
			'default'       => [
				[
					'label' => 'English',
					'id'    => 'en',
				],
				[
					'label' => 'Español',
					'id'    => 'es',
				],
				[
					'label' => 'Nederlands',
					'id'    => 'nl',
				],
				[
					'label' => 'Français',
					'id'    => 'fr',
				],
			],
		];

		$this->controls['buttonText'] = [
			'tab'     => 'content',
			'label'   => esc_html__( 'Button Text', 'bricks' ),
			'type'    => 'text',
			'default' => 'Continue',
		];
	}

	/**
	 * Render the element.
	 *
	 * @return void
	 */
	public function render() {
		$settings = $this->settings;

		var_dump("dsdsds");

		$title          = ! empty( $settings['title'] ) ? $this->render_dynamic_data( $settings['title'] ) : '';
		$location_title = ! empty( $settings['locationTitle'] ) ? $this->render_dynamic_data( $settings['locationTitle'] ) : '';
		$language_title = ! empty( $settings['languageTitle'] ) ? $this->render_dynamic_data( $settings['languageTitle'] ) : '';
		$button_text    = ! empty( $settings['buttonText'] ) ? $this->render_dynamic_data( $settings['buttonText'] ) : '';

		$locations = ! empty( $settings['locations'] ) ? $settings['locations'] : [];
		$languages = ! empty( $settings['languages'] ) ? $settings['languages'] : [];

		$this->set_attribute( '_root', 'class', 'modal modal-welcome' );

		echo '<div ' . $this->render_attributes( '_root' ) . '>';
		echo '<div class="modal-content">';
		if ( $title ) {
			echo '<h2>' . esc_html( $title ) . '</h2>';
		}
		echo '<a href="#" class="icon-close"></a>';
		echo '<form class="location-language-form" action="'.admin_url( 'admin-post.php' ).'" method="POST">';

		if ( $location_title ) {
			echo '<h3>' . esc_html( $location_title ) . '</h3>';
		}

		foreach ( $locations as $index => $location ) {
			$label = ! empty( $location['label'] ) ? $this->render_dynamic_data( $location['label'] ) : '';
			$id    = ! empty( $location['id'] ) ? esc_attr( $location['id'] ) : 'loc-' . $index;

			echo '<div class="radio-button">';
			echo '<input type="radio" value="' . $id . '" name="location" id="' . $id . '">';
			echo '<label for="' . $id . '">' . esc_html( $label ) . '</label>';
			echo '</div>';
		}

		if ( $language_title ) {
			echo '<h3>' . esc_html( $language_title ) . '</h3>';
		}

		foreach ( $languages as $index => $language ) {
			$label = ! empty( $language['label'] ) ? $this->render_dynamic_data( $language['label'] ) : '';
			$id    = ! empty( $language['id'] ) ? esc_attr( $language['id'] ) : 'lang-' . $index;

			echo '<div class="radio-button">';
			echo '<input type="radio" value="' . $id . '" name="language" id="' . $id . '">';
			echo '<label for="' . $id . '">' . esc_html( $label ) . '</label>';
			echo '</div>';
		}
		echo '<input type="hidden" name="action" value="welcome_modal">';
		wp_nonce_field( 'welcome_modal', 'welcome_nonce');
		echo '<div class="submit">';
		echo '<button type="submit" class="btn">' . esc_html( $button_text ) . '</button>';
		echo '</div>';

		echo '</form>';
		echo '</div>';
		echo '</div>';
	}
}
