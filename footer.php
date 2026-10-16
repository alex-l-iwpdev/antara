<?php
namespace Bricks;

do_action( 'bricks_before_footer' );

do_action( 'render_footer' );

do_action( 'bricks_after_footer' );

do_action( 'bricks_after_site_wrapper' );

?>
	<!--
	  ANTARA · BIRTHDAY POP-UP · Fall into Stillness
	  Paste this ONCE (Bricks page settings > Custom code > Body footer, or WPCode).
	  It shows itself only from 19 October 2026 00:00 to 21 October 2026 23:59 (Brussels/Barcelona time),
	  only on the Fall into Stillness pages, in the visitor's page language (EN/NL/FR/ES).
	  Before and after those three days it does nothing. No website copy changes needed.
	  It opens 5 seconds after the page loads, or earlier if the visitor scrolls down, once per visit.
	  After closing, a small 'Birthday gift' button stays bottom-left to reopen it.
	  Preview any time by adding ?birthday-preview=1 to the retreat page URL.
	-->
	<div id="ab-root" hidden></div>
	<style>
		#ab-root{--ab-paper:#F6F0E7;--ab-ink:#2D2A25;--ab-soft:#6B6358;--ab-moss:#3E4B3B;--ab-ember:#B7683F;--ab-line:rgba(45,42,37,.14);font-family:inherit}
		#ab-root *{box-sizing:border-box}
		.ab-veil{position:fixed;inset:0;z-index:99998;background:rgba(30,28,24,.45);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);opacity:0;transition:opacity .6s ease}
		.ab-card{position:fixed;z-index:99999;left:50%;top:50%;width:min(440px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;transform:translate(-50%,-46%);opacity:0;transition:opacity .6s ease,transform .6s ease;background:var(--ab-paper);color:var(--ab-ink);border-radius:20px;padding:36px 32px 28px;box-shadow:0 30px 80px rgba(20,18,15,.28);text-align:center}
		.ab-open .ab-veil{opacity:1}
		.ab-open .ab-card{opacity:1;transform:translate(-50%,-50%)}
		.ab-close{position:absolute;top:12px;right:12px;width:36px;height:36px;border:0;background:transparent;color:var(--ab-soft);font-size:22px;line-height:1;cursor:pointer;border-radius:50%}
		.ab-close:hover{background:var(--ab-line)}
		.ab-candle{display:block;margin:0 auto 14px;width:34px;height:58px}
		.ab-flame{transform-origin:17px 20px;animation:ab-flicker 2.6s ease-in-out infinite}
		@keyframes ab-flicker{0%,100%{transform:scale(1) rotate(0)}30%{transform:scale(1.04,.96) rotate(-2deg)}60%{transform:scale(.97,1.05) rotate(2deg)}}
		@media (prefers-reduced-motion:reduce){.ab-flame{animation:none}.ab-card,.ab-veil{transition:none}}
		.ab-eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--ab-ember);margin:0 0 12px}
		.ab-title{font-size:24px;line-height:1.3;font-weight:400;margin:0 0 14px;color:var(--ab-ink)}
		.ab-body{font-size:15px;line-height:1.6;color:var(--ab-soft);margin:0 0 22px}
		.ab-body strong{color:var(--ab-ink);font-weight:600}
		#ab-root .ab-gap{display:block !important;height:1em;margin:0;padding:0}
		.ab-label{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ab-soft);margin:0 0 8px}
		.ab-code{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px dashed var(--ab-moss);border-radius:12px;padding:10px 10px 10px 18px;margin:0 0 8px}
		.ab-code span{font-size:20px;letter-spacing:.12em;font-weight:600;color:var(--ab-moss)}
		.ab-copy{border:0;border-radius:8px;background:var(--ab-moss);color:var(--ab-paper);font:inherit;font-size:13px;padding:9px 14px;cursor:pointer;min-width:92px}
		.ab-howto{font-size:13px;line-height:1.5;color:var(--ab-soft);margin:0 0 18px}
		.ab-valid{font-size:13px;line-height:1.5;color:var(--ab-ink);background:rgba(183,104,63,.10);border-radius:10px;padding:10px 14px;margin:0 0 22px}
		.ab-cta{display:inline-block;width:100%;border:0;border-radius:999px;background:var(--ab-ink);color:var(--ab-paper);font:inherit;font-size:15px;padding:14px 22px;cursor:pointer;text-decoration:none}
		.ab-cta:hover{background:var(--ab-moss)}
		.ab-sign{font-size:14px;font-style:italic;color:var(--ab-soft);margin:16px 0 0}
		.ab-pill{position:fixed;z-index:99997;left:16px;bottom:16px;border:0;border-radius:999px;background:var(--ab-paper);color:var(--ab-ink);font:inherit;font-size:13px;padding:11px 16px;box-shadow:0 8px 28px rgba(20,18,15,.22);cursor:pointer;opacity:0;transform:translateY(8px);transition:opacity .4s ease,transform .4s ease}
		.ab-pill.ab-show{opacity:1;transform:none}
		.ab-pill b{color:var(--ab-ember);font-weight:600}
		@media (max-width:520px){
			.ab-card{top:auto;bottom:0;left:0;width:100%;max-height:92vh;border-radius:20px 20px 0 0;padding:30px 22px 24px;transform:translateY(30px)}
			.ab-open .ab-card{transform:none}
			.ab-title{font-size:21px}
		}
	</style>
	<script>
		(function(){
			var START = Date.parse('2026-10-19T00:00:00+02:00');
			var END   = Date.parse('2026-10-22T00:00:00+02:00');
			var DELAY = 5000;
			var CODE  = 'BIRTHDAY150';

			var preview = /[?&]birthday-preview=1/.test(location.search);
			var now = Date.now();
			if (!preview && (now < START || now >= END)) return;
			if (!/fall-into-stillness/.test(location.pathname)) return;

			var T = {
				en:{eyebrow:'19 to 21 October \u00b7 A birthday gift',title:'It\u2019s my birthday, and I\u2019d like to share something with you.',body:'For these three days, you receive <strong>\u20ac150 off</strong> your place at the Fall into Stillness retreat.<span class="ab-gap"></span>Five days of breathwork, movement and sound sessions, 18\u00a0to\u00a022\u00a0November.',label:'Your code',copy:'Copy',copied:'Copied',howto:'For the first 10 people who book, in a shared or private room. Enter the code when you book.',valid:'Valid until Wednesday 21 October, 23:59 (Brussels and Barcelona time).',cta:'Choose your room',sign:'With warmth, Killian',pill:'Birthday gift: <b>\u20ac150 off</b> until Wednesday',close:'Close'},
				nl:{eyebrow:'19 tot 21 oktober \u00b7 Een verjaardagscadeau',title:'Het is mijn verjaardag, en ik wil graag iets met je delen.',body:'Deze drie dagen krijg je <strong>\u20ac150 korting</strong> op je plek bij de Fall into Stillness retraite.<span class="ab-gap"></span>Vijf dagen ademwerk, beweging en klanksessies, van\u00a018\u00a0tot\u00a022\u00a0november.',label:'Jouw code',copy:'Kopieer',copied:'Gekopieerd',howto:'Voor de eerste 10 mensen die boeken, in een gedeelde of priv\u00e9kamer. Vul de code in bij je boeking.',valid:'Geldig tot woensdag 21 oktober, 23:59 (Belgische tijd).',cta:'Kies je kamer',sign:'Met warmte, Killian',pill:'Verjaardagscadeau: <b>\u20ac150 korting</b> tot woensdag',close:'Sluiten'},
				fr:{eyebrow:'Du 19 au 21 octobre \u00b7 Un cadeau d\u2019anniversaire',title:'C\u2019est mon anniversaire, et j\u2019aimerais le partager avec vous.',body:'Pendant ces trois jours, vous b\u00e9n\u00e9ficiez de <strong>150\u00a0\u20ac de r\u00e9duction</strong> sur votre place \u00e0 la retraite Fall into Stillness.<span class="ab-gap"></span>Cinq jours de s\u00e9ances de respiration, de mouvement et de son, du\u00a018\u00a0au\u00a022\u00a0novembre.',label:'Votre code',copy:'Copier',copied:'Copi\u00e9',howto:'Pour les 10 premi\u00e8res personnes qui r\u00e9servent, en chambre partag\u00e9e ou priv\u00e9e. Saisissez le code lors de votre r\u00e9servation.',valid:'Valable jusqu\u2019au mercredi 21 octobre, 23\u00a0h\u00a059 (heure de Bruxelles).',cta:'Choisir votre chambre',sign:'Chaleureusement, Killian',pill:'Cadeau d\u2019anniversaire\u00a0: <b>150\u00a0\u20ac de r\u00e9duction</b> jusqu\u2019\u00e0 mercredi',close:'Fermer'},
				es:{eyebrow:'Del 19 al 21 de octubre \u00b7 Un regalo de cumplea\u00f1os',title:'Es mi cumplea\u00f1os, y me gustar\u00eda compartir algo contigo.',body:'Durante estos tres d\u00edas, tienes <strong>150\u00a0\u20ac de descuento</strong> en tu plaza en el retiro Fall into Stillness.<span class="ab-gap"></span>Cinco d\u00edas de sesiones de respiraci\u00f3n, movimiento y sonido, del\u00a018\u00a0al\u00a022\u00a0de\u00a0noviembre.',label:'Tu c\u00f3digo',copy:'Copiar',copied:'Copiado',howto:'Para las primeras 10 personas que reserven, en habitaci\u00f3n compartida o privada. Introduce el c\u00f3digo al reservar.',valid:'V\u00e1lido hasta el mi\u00e9rcoles 21 de octubre, a las 23:59 (hora de Barcelona).',cta:'Elige tu habitaci\u00f3n',sign:'Con cari\u00f1o, Killian',pill:'Regalo de cumplea\u00f1os: <b>150\u00a0\u20ac de descuento</b> hasta el mi\u00e9rcoles',close:'Cerrar'}
			};
			var lang = (document.documentElement.lang || 'en').slice(0,2).toLowerCase();
			var t = T[lang] || T.en;

			var store = {get:function(k){try{return sessionStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}};
			var root = document.getElementById('ab-root');
			if (!root) return;

			var candle = '<svg class="ab-candle" viewBox="0 0 34 58" aria-hidden="true"><path class="ab-flame" d="M17 4c4 6 6 9 6 12.5A6 6 0 0 1 11 16.5C11 13 13 10 17 4z" fill="#B7683F"/><path d="M17 11c1.6 2.6 2.4 4 2.4 5.6a2.4 2.4 0 0 1-4.8 0c0-1.6.8-3 2.4-5.6z" fill="#F2C48D"/><line x1="17" y1="22" x2="17" y2="27" stroke="#2D2A25" stroke-width="1.2"/><rect x="11" y="27" width="12" height="29" rx="2" fill="none" stroke="#3E4B3B" stroke-width="1.4"/></svg>';

			root.innerHTML =
				'<div class="ab-veil" data-ab-close></div>'+
				'<div class="ab-card" role="dialog" aria-modal="true" aria-labelledby="ab-title" tabindex="-1" style="outline:none">'+
				'<button class="ab-close" type="button" aria-label="'+t.close+'" data-ab-close>&times;</button>'+
				candle+
				'<p class="ab-eyebrow">'+t.eyebrow+'</p>'+
				'<h2 class="ab-title" id="ab-title">'+t.title+'</h2>'+
				'<p class="ab-body">'+t.body+'</p>'+
				'<p class="ab-label">'+t.label+'</p>'+
				'<div class="ab-code"><span>'+CODE+'</span><button class="ab-copy" type="button">'+t.copy+'</button></div>'+
				'<p class="ab-howto">'+t.howto+'</p>'+
				'<p class="ab-valid">'+t.valid+'</p>'+
				'<a class="ab-cta" href="#retreat" data-ab-cta>'+t.cta+'</a>'+
				'<p class="ab-sign">'+t.sign+'</p>'+
				'</div>';

			var pill = document.createElement('button');
			pill.type = 'button'; pill.className = 'ab-pill'; pill.innerHTML = t.pill;
			document.body.appendChild(pill);

			var lastFocus = null;
			function open(){
				lastFocus = document.activeElement;
				root.hidden = false;
				pill.classList.remove('ab-show');
				requestAnimationFrame(function(){requestAnimationFrame(function(){root.classList.add('ab-open')})});
				var c = root.querySelector('.ab-card'); if (c) c.focus({preventScroll:true});
				store.set('ab-seen','1');
			}
			function close(){
				root.classList.remove('ab-open');
				setTimeout(function(){root.hidden = true; pill.classList.add('ab-show')}, 450);
				if (lastFocus && lastFocus.focus) lastFocus.focus({preventScroll:true});
			}
			root.addEventListener('click', function(e){
				if (e.target.closest('[data-ab-close]')) close();
				if (e.target.closest('[data-ab-cta]')) { close(); }
			});
			document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && !root.hidden) close(); });
			pill.addEventListener('click', open);

			root.querySelector('.ab-copy').addEventListener('click', function(){
				var btn = this;
				function done(){ btn.textContent = t.copied; setTimeout(function(){btn.textContent = t.copy}, 2200); }
				if (navigator.clipboard && navigator.clipboard.writeText) {
					navigator.clipboard.writeText(CODE).then(done, fallback);
				} else { fallback(); }
				function fallback(){
					var ta = document.createElement('textarea'); ta.value = CODE; ta.setAttribute('readonly','');
					ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select();
					try{document.execCommand('copy')}catch(e){} document.body.removeChild(ta); done();
				}
			});

			// Hide everything the moment the day ends, even if the tab stays open.
			if (!preview) setTimeout(function(){ root.remove(); pill.remove(); }, Math.max(0, END - Date.now()));

			// Show once per visit: after DELAY, or as soon as the visitor starts scrolling, whichever comes first.
			if (store.get('ab-seen')) { pill.classList.add('ab-show'); }
			else {
				var fired = false;
				function trigger(){ if (fired) return; fired = true; window.removeEventListener('scroll', onScroll); open(); }
				function onScroll(){ if (window.scrollY > window.innerHeight * 0.6) trigger(); }
				setTimeout(trigger, DELAY);
				window.addEventListener('scroll', onScroll, {passive:true});
			}
		})();
	</script>

	<!--
	  ANTARA · BIRTHDAY BANNER · all pages except Fall into Stillness
	  Paste this ONCE site-wide (Bricks > Settings > Custom code > Body footer, or WPCode "site wide footer").
	  It shows a slim bar at the bottom of the screen only from 19 October 2026 00:00 to 21 October 2026 23:59
	  (Brussels/Barcelona time), in the visitor's page language (EN/NL/FR/ES), and links to the retreat page.
	  It does NOT show on the Fall into Stillness pages (they have their own pop-up).
	  Visitors can close it with the ×; it then stays hidden for the rest of their visit.
	  Preview any time by adding ?birthday-preview=1 to any page URL.
	-->
	<div id="abb-root" hidden></div>
	<style>
		#abb-root{--abb-olive:#202101;--abb-paper:#F6F0EE;--abb-blush:#CDA598;font-family:inherit}
		#abb-root .abb-bar{position:fixed;z-index:99990;left:50%;bottom:16px;transform:translate(-50%,24px);opacity:0;transition:opacity .5s ease,transform .5s ease;display:flex;align-items:center;gap:6px;max-width:calc(100vw - 32px);background:var(--abb-olive);color:var(--abb-paper);border-radius:999px;padding:6px 6px 6px 8px;box-shadow:0 10px 30px rgba(20,18,15,.28)}
		#abb-root.abb-show .abb-bar{opacity:1;transform:translate(-50%,0)}
		#abb-root .abb-link{display:flex;align-items:center;gap:10px;color:var(--abb-paper);text-decoration:none;font-size:14px;line-height:1.35;padding:6px 6px 6px 8px}
		#abb-root .abb-link b{color:var(--abb-blush);font-weight:500}
		#abb-root .abb-arrow{white-space:nowrap;color:var(--abb-blush);font-weight:500}
		#abb-root .abb-link:hover .abb-arrow{text-decoration:underline;text-underline-offset:3px}
		#abb-root .abb-candle{flex:0 0 auto;width:14px;height:24px}
		#abb-root .abb-x{flex:0 0 auto;width:32px;height:32px;border:0;border-radius:50%;background:rgba(246,240,238,.12);color:var(--abb-paper);font-size:18px;line-height:1;cursor:pointer; text-align: center}
		#abb-root .abb-x:hover{background:rgba(246,240,238,.22)}
		@media (max-width:520px){
			#abb-root .abb-bar{bottom:12px;width:calc(100vw - 24px);max-width:none}
			#abb-root .abb-link{font-size:13px}
		}
		@media (prefers-reduced-motion:reduce){#abb-root .abb-bar{transition:none}}
	</style>
	<script>
		(function(){
			var START = Date.parse('2026-10-19T00:00:00+02:00');
			var END   = Date.parse('2026-10-22T00:00:00+02:00');
			var DELAY = 2500;
			var preview = /[?&]birthday-preview=1/.test(location.search);
			var now = Date.now();
			if (!preview && (now < START || now >= END)) return;
			if (/fall-into-stillness/.test(location.pathname)) return;
			try { if (sessionStorage.getItem('abb-closed')) return; } catch(e) {}
			var T = {
				en:{text:'My birthday gift: <b>€150 off</b> the Fall into Stillness retreat, until Wednesday',more:'Discover →',url:'/events/fall-into-stillness-en/',close:'Close'},
				nl:{text:'Mijn verjaardagscadeau: <b>€150 korting</b> op de Fall into Stillness retraite, tot woensdag',more:'Ontdek →',url:'/nl/evenementen/fall-into-stillness-nl/',close:'Sluiten'},
				fr:{text:'Mon cadeau d’anniversaire : <b>150 € de réduction</b> sur la retraite Fall into Stillness, jusqu’à mercredi',more:'Découvrir →',url:'/fr/evenements/fall-into-stillness-fr/',close:'Fermer'},
				es:{text:'Mi regalo de cumpleaños: <b>150 € de descuento</b> en el retiro Fall into Stillness, hasta el miércoles',more:'Descubrir →',url:'/es/eventos/fall-into-stillness-es/',close:'Cerrar'}
			};
			var lang = (document.documentElement.lang || 'en').slice(0,2).toLowerCase();
			var t = T[lang] || T.en;
			var root = document.getElementById('abb-root');
			if (!root) return;
			var candle = '<svg class="abb-candle" viewBox="0 0 34 58" aria-hidden="true"><path d="M17 4c4 6 6 9 6 12.5A6 6 0 0 1 11 16.5C11 13 13 10 17 4z" fill="#CDA598"/><path d="M17 11c1.6 2.6 2.4 4 2.4 5.6a2.4 2.4 0 0 1-4.8 0c0-1.6.8-3 2.4-5.6z" fill="#EDD7AB"/><line x1="17" y1="22" x2="17" y2="27" stroke="#F6F0EE" stroke-width="1.6"/><rect x="11" y="27" width="12" height="29" rx="2" fill="none" stroke="#F6F0EE" stroke-width="1.8"/></svg>';
			var href = t.url + (preview ? '?birthday-preview=1' : '');
			root.innerHTML =
				'<div class="abb-bar" role="region" aria-label="Birthday gift">'+
				'<a class="abb-link" href="'+href+'">'+candle+'<span>'+t.text+' <span class="abb-arrow">'+t.more+'</span></span></a>'+
				'<button class="abb-x" type="button" aria-label="'+t.close+'">&times;</button>'+
				'</div>';
			root.hidden = false;
			root.querySelector('.abb-x').addEventListener('click', function(){
				root.classList.remove('abb-show');
				try { sessionStorage.setItem('abb-closed','1'); } catch(e) {}
				setTimeout(function(){ root.hidden = true; }, 500);
			});
			// Remove the bar the moment the offer ends, even if the tab stays open.
			if (!preview) setTimeout(function(){ root.remove(); }, Math.max(0, END - Date.now()));
			setTimeout(function(){ requestAnimationFrame(function(){ root.classList.add('abb-show'); }); }, DELAY);
		})();
	</script>
<?php
wp_footer();

echo '</body>';
echo '</html>';
