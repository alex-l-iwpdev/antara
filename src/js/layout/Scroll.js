import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";


const Scroll = ($)=>{
// Make sure GSAP is connected
	document.addEventListener("DOMContentLoaded", () => {
		initScrollBasedScroller();
	});

	function initScrollBasedScroller() {
		const scrollers = document.querySelectorAll(".scroller");

		scrollers.forEach((scroller) => {
			const wrapper = scroller.querySelector(".scroller-wrapper");
			if (!wrapper) return;

			// <--- NEW: Remove <noscript> tags so as not to interfere ---
			wrapper.querySelectorAll('noscript').forEach(ns => ns.remove());

			const items = Array.from(wrapper.children);
			if (items.length === 0) return;

			// <--- NEW: Small helper function so as not to duplicate code ---
			const processClone = (clone) => {
				const img = clone.querySelector('img');
				if (img) {
					if (img.dataset.src) img.src = img.dataset.src;
					if (img.dataset.srcset) img.srcset = img.dataset.srcset;
					img.classList.remove('lazyload', 'lazyloading');
					img.classList.add('lazyloaded');
				}
			};

			// === Add duplicates to the beginning and end (YOUR CODE) ===
			const minWidthMultiplier = 40;
			const containerWidth = scroller.offsetWidth;
			let totalWidth = wrapper.scrollWidth;

			while (totalWidth < containerWidth * minWidthMultiplier) {
				items.forEach((item) => {
					const cloneEnd = item.cloneNode(true);
					cloneEnd.classList.add("scroller-clone");
					processClone(cloneEnd); // <--- NEW: "Пробуждаем" клон для конца
					wrapper.appendChild(cloneEnd);

					const cloneStart = item.cloneNode(true);
					cloneStart.classList.add("scroller-clone");
					processClone(cloneStart); // <--- NEW: "Пробуждаем" клон для начала
					wrapper.insertBefore(cloneStart, wrapper.firstChild);
				});
				totalWidth = wrapper.scrollWidth;
			}

			// === Scroll animation (YOUR CODE) ===
			let lastScrollTop = window.scrollY;

			const offsetStart = wrapper.scrollWidth / 2;
			let currentX = -offsetStart;
			let targetX = -offsetStart;

			const speedFactor = 0.3;

			window.addEventListener("scroll", () => {
				const st = window.scrollY;
				const delta = st - lastScrollTop;
				targetX -= delta * speedFactor;
				lastScrollTop = st;
			});

			gsap.ticker.add(() => {
				currentX += (targetX - currentX) * 0.1;
				gsap.set(wrapper, { x: currentX });
			});
		});
	}

	// gsap.registerPlugin(ScrollTrigger, ScrollSmoother); // Registration is now in app.js

	// Using matchMedia to control logic
	let mm = gsap.matchMedia();

	// Adding a condition: what to do when the screen is GREATER than or equal to 768px (Desktop/Tablet)
	// 768px is the standard breakpoint, you can choose your own
	mm.add("(min-width: 768px)", () => {

		// --- 1. Initialize ScrollSmoother (DESKTOP ONLY) ---
		let smoother; // We declare the variable here so that it is available below
		try {
			smoother = ScrollSmoother.create({
				wrapper: '#brxe-bpimyf',
				content: '#brxe-hozihq',
				smooth: 1.5,
				effects: true,
				normalizeScroll: true,
				ignoreMobileResize: true
			});

		} catch (e) {
			console.error("ScrollSmoother failed to initialize: ", e);
		}


		// --- 2. Parallax for CARDS (DESKTOP ONLY) ---
		gsap.utils.toArray(".shop-content-item").forEach(item => {

			const minMove = 30;
			const maxMove = 120;
			const magnitude = gsap.utils.random(minMove, maxMove);
			const direction = Math.random() < 0.5 ? -1 : 1;
			const randomY = magnitude * direction;


			gsap.to(item, {
				y: randomY,
				ease: "none",
				scrollTrigger: {
					trigger: item,
					start: "top bottom",
					end: "bottom top",
					scrub: true,
					// If ScrollSmoother is active, it automatically uses its coordinates
				}
			});
		});


		// --- 3. Logic for displaying the form #brxe-pwzueh (DESKTOP ONLY) ---
		const formElement = document.getElementById('brxe-pwzueh');

		if (formElement) {
			// IMPORTANT: When ScrollSmoother is initialized, it may reset the body/html styles.
			// So a ScrollTrigger bound to document.body will work correctly inside Smoother.

			gsap.set(formElement, { opacity: 0, display: 'none' });

			ScrollTrigger.create({
				trigger: document.body,
				start: "top top",
				end: "bottom bottom",

				onUpdate: (self) => {
					const scrollProgress = self.progress;
					const isFormVisible = formElement.style.display !== 'none';

					if (scrollProgress >= 0.9) {
						if (!isFormVisible) {
							gsap.fromTo(formElement,
								{ opacity: 0, display: 'flex' },
								{ opacity: 1, duration: 0.5, ease: "power2.out" }
							);
						}
					} else {
						if (isFormVisible) {
							gsap.to(formElement, {
								opacity: 0,
								duration: 0.3,
								ease: "power2.in",
								onComplete: () => formElement.style.display = 'none'
							});
						}
					}
				}
			});
		}

		// ⚠️ Return (kill) for matchMedia
		// This function will be executed when the screen size becomes LESS THAN 768px,
		// clearing all ScrollTriggers and Smoother created above.
		return () => {
			if (smoother) smoother.kill();
			// ScrollTriggers created inside mm.add(),
			// are destroyed automatically, this is the beauty of GSAP.
		}
	});

	// (Optional) What to do on mobile (< 768px)
	mm.add("(max-width: 767px)", () => {
		// Here you can add mobile logic if needed
		// For example, some light animations or just leave everything as it is (without scrollsmoozer)

		// For the #brxe-pwzueh form, just make sure it is hidden or shown in the standard way,
		// if you don't want to see it on mobile, you can just make sure its display: none in the CSS.
		const formElement = document.getElementById('brxe-pwzueh');
		if (formElement) {
			// Remove styles that could have been applied by the desktop code (if it had had time to execute)
			gsap.set(formElement, { clearProps: "all" });
			formElement.style.display = 'none'; // If you need to be sure to hide
		}

		// The return function is not needed here, since we did not create anything that needs to be “kicked”
	});
}

export default Scroll
