<?php
/**
 * Template Name: Test Conect.
 */

//// Включаем отображение ошибок для тестирования
//ini_set('display_errors', '1');
//ini_set('display_startup_errors', '1');
//error_reporting(E_ALL);
//
//// Подключаем автозагрузчик Composer при необходимости
//$autoload_file = __DIR__ . '/vendor/autoload.php';
//if (file_exists($autoload_file)) {
//	require_once $autoload_file;
//}
//
//// Если скрипт вызван напрямую без инициализации WordPress
//if (!defined('FB_APP_ID_CONSVERS') && defined('ABSPATH') === false) {
//	$wp_load_path = dirname(__DIR__, 4) . '/wp-load.php';
//	if (file_exists($wp_load_path)) {
//		require_once $wp_load_path;
//	}
//}

use FacebookAds\Api;
use FacebookAds\Object\ServerSide\Content;
use FacebookAds\Object\ServerSide\CustomData;
use FacebookAds\Object\ServerSide\Event;
use FacebookAds\Object\ServerSide\EventRequest;
use FacebookAds\Object\ServerSide\UserData;

try {
	if (!defined('FB_APP_ID_CONSVERS')) {
		throw new \RuntimeException('Константа FB_APP_ID_CONSVERS не определена в wp-config.php');
	}

	Api::init(null, null, FB_APP_ID_CONSVERS);

	$user_data = (new UserData())
		->setEmail('test_conenct@eg.com')
		->setClientIpAddress($_SERVER['REMOTE_ADDR'] ?? '83.175.187.164')
		->setClientUserAgent($_SERVER['HTTP_USER_AGENT'] ?? 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36');

	$order_id = 'ORDER_' . time();

	$content = (new Content())
		->setProductId('product_001')
		->setQuantity(1)
		->setItemPrice(10.45)
		->setTitle('Test Product');

	$custom_data = (new CustomData())
		->setCurrency('USD')
		->setValue(10.45)
		->setContentType('product')
		->setContentIds(['product_001'])
		->setContents([$content])
		->setOrderId($order_id)
		->setNumItems(1);

	$event = (new Event())
		->setEventName('Purchase')
		->setEventTime(time())
		->setEventId($order_id)
		->setEventSourceUrl((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'antara.be') . ($_SERVER['REQUEST_URI'] ?? '/test-conect/'))
		->setUserData($user_data)
		->setCustomData($custom_data);

	$request = (new EventRequest('813266761061472'))
		->setEvents([$event]);

	// Если нужно протестировать в реальном времени во вкладке Events Manager -> Test Events:
	// скопируйте код вида TEST12345 во вкладке "Тестирование событий" и раскомментируйте строку ниже:
//	 $request->setTestEventCode('TEST12995');

	$response = $request->execute();

	echo '<pre>';
	print_r($response);
	echo '</pre>';
} catch (\Throwable $e) {
	echo '<div style="background: #ffe6e6; border: 1px solid #ff4d4f; padding: 15px; margin: 20px; font-family: monospace;">';
	echo '<h3 style="color: #cf1322; margin-top: 0;">Ошибка выполнения Facebook Conversions API:</h3>';
	echo '<p><b>Сообщение:</b> ' . htmlspecialchars($e->getMessage()) . '</p>';
	echo '<p><b>Файл:</b> ' . htmlspecialchars($e->getFile()) . ':' . $e->getLine() . '</p>';
	echo '<p><b>Класс ошибки:</b> ' . htmlspecialchars(get_class($e)) . '</p>';
	echo '<pre style="background: #fff; padding: 10px; overflow: auto;">' . htmlspecialchars($e->getTraceAsString()) . '</pre>';
	echo '</div>';
}
