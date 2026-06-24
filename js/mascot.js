/**
 * BrushestoPixels - Interactive CSS-Art Mascot Engine
 */

    //BRUSHES
    window.addEventListener("load", function () {
      const catEl = document.getElementById("brushesCat");
      const catBody = document.getElementById("catBody");
      const catSpeech = document.getElementById("catSpeech");
      const catMsg = document.getElementById("catMsg");

      if (!catEl || !catBody || !catSpeech || !catMsg) return; // safety guard

      let catMood = "idle";
      let speechTimer = null;
      let blinkTimer = null;
      let isDragging = false;
      let dragOffX = 0,
        dragOffY = 0;
      let pawsUp = false;

      /* ── speak ── */
      function catSpeak(msg, duration = 3200) {
        catMsg.textContent = msg;
        catSpeech.style.opacity = "1";
        catSpeech.style.transform = "scale(1) translateY(0)";
        clearTimeout(speechTimer);
        speechTimer = setTimeout(() => {
          catSpeech.style.opacity = "0";
          catSpeech.style.transform = "scale(0.85) translateY(6px)";
        }, duration);
      }

      /* ── set mood / animation ── */
      function catSetMood(mood) {
        catMood = mood;
        catBody.className = "cat-body cat-" + mood;
      }

      /* ── blink randomly ── */
      function scheduleBlink() {
        clearTimeout(blinkTimer);
        blinkTimer = setTimeout(
          () => {
            const eyes = catEl.querySelectorAll(".cat-eye-inner");
            eyes.forEach((e) => {
              e.style.transform = "scaleY(0.1)";
            });
            setTimeout(() => {
              eyes.forEach((e) => {
                e.style.transform = "scaleY(1)";
              });
              scheduleBlink();
            }, 120);
          },
          2000 + Math.random() * 3000,
        );
      }
      scheduleBlink();

      /* ── idle wiggles ── */
      setInterval(() => {
        if (!isDragging && catMood === "idle") {
          const msgs = [
            "ROAR! 🐯",
            "I guard this collection ✦",
            "Each piece has a soul 🔥",
            "Tap me! 🐯",
            "Handcrafted with power",
            "The hunt for beauty...",
            "I approve this decor 🎨",
          ];
          if (Math.random() < 0.3)
            catSpeak(msgs[Math.floor(Math.random() * msgs.length)], 2800);
        }
      }, 8000);

      /* ── drag to move ── */
      function startDrag(clientX, clientY) {
        isDragging = true;
        const rect = catEl.getBoundingClientRect();
        dragOffX = clientX - rect.left;
        dragOffY = clientY - rect.top;
        catEl.style.transition = "none";
        catEl.style.cursor = "grabbing";
        catSetMood("held");
        catSpeak("Release me, human! 🐯", 2000);
      }

      function moveDrag(clientX, clientY) {
        if (!isDragging) return;
        catEl.style.right = "auto";
        catEl.style.bottom = "auto";
        catEl.style.left = clientX - dragOffX + "px";
        catEl.style.top = clientY - dragOffY + "px";
      }

      function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        catEl.style.transition = "all 0.35s ease";
        catEl.style.cursor = "grab";
        catSetMood("idle");
        catSpeak("A tiger bows to no one! 🐯", 2000);
      }

      // Mouse
      catEl.addEventListener("mousedown", (e) => {
        startDrag(e.clientX, e.clientY);
        e.preventDefault();
      });
      document.addEventListener("mousemove", (e) =>
        moveDrag(e.clientX, e.clientY),
      );
      document.addEventListener("mouseup", endDrag);

      // Touch
      catEl.addEventListener(
        "touchstart",
        (e) => {
          startDrag(e.touches[0].clientX, e.touches[0].clientY);
        },
        { passive: true },
      );
      document.addEventListener(
        "touchmove",
        (e) => {
          if (isDragging)
            moveDrag(e.touches[0].clientX, e.touches[0].clientY);
        },
        { passive: true },
      );
      document.addEventListener("touchend", endDrag);

      /* ── click to pet ── */
      catEl.addEventListener("click", (e) => {
        if (isDragging) return;
        pawsUp = !pawsUp;
        if (pawsUp) {
          catSetMood("happy");
          catSpeak(
            [
              "RAWRR~ 🐯",
              "The tiger is pleased!",
              "Power and beauty ✨",
              "You have royal taste! 🎨",
            ][Math.floor(Math.random() * 4)],
            2500,
          );
        } else {
          catSetMood("idle");
          catSpeak("*growls softly* 🐯", 1500);
        }
      });

      /* ── react to site events ── */

      /* add to cart */
      const _origAddToCart = addToCart;
      window.addToCart = function (btn, id) {
        if (typeof btn === "number") {
          id = btn;
          btn = null;
        }
        const success = _origAddToCart(btn, id);
        if (success) {
          catSetMood("excited");
          catSpeak(
            [
              "Roar-worthy choice! 🛒",
              "The tiger approves! ✦",
              "That one is mighty! 🐯",
              "You hunt with great taste! 🔥",
            ][Math.floor(Math.random() * 4)],
            3000,
          );
          setTimeout(() => catSetMood("idle"), 3000);
        } else {
          catSetMood("curious");
          catSpeak("Oh! That piece is out of stock... 🐾", 3000);
          setTimeout(() => catSetMood("idle"), 3000);
        }
      };

      /* open cart */
      const _origOpenCart = openCart;
      window.openCart = function () {
        _origOpenCart();
        catSetMood("curious");
        catSpeak("Inspecting the prey... 👀", 2500);
        setTimeout(() => catSetMood("idle"), 2500);
      };

      /* checkout opened */
      const _origOpenCheckout = openCheckout;
      window.openCheckout = function () {
        _origOpenCheckout();
        catSetMood("excited");
        catSpeak("Almost claimed! Fill in your details 📝", 3500);
        setTimeout(() => catSetMood("idle"), 3500);
      };

      /* order success */
      document.getElementById("closeSuccess").addEventListener(
        "click",
        () => {
          catSetMood("happy");
          catSpeak("The tiger roars in triumph! 🐯🎉", 4000);
          setTimeout(() => catSetMood("idle"), 4000);
        },
        true,
      );

      /* search */
      document
        .getElementById("productSearch")
        .addEventListener("focus", () => {
          catSpeak("On the hunt? I can help 🔍", 2200);
        });

      /* scroll — cat peeks */
      let lastScrollY = 0;
      window.addEventListener("scroll", () => {
        const diff = window.scrollY - lastScrollY;
        lastScrollY = window.scrollY;
        if (Math.abs(diff) > 80 && !isDragging && catMood === "idle") {
          catSetMood("curious");
          setTimeout(() => {
            if (catMood === "curious") catSetMood("idle");
          }, 1200);
        }
      });

      /* wishlist */
      document.addEventListener("click", (e) => {
        if (e.target.classList.contains("product-wishlist")) {
          const isNowLiked = e.target.textContent === "♥";
          if (isNowLiked) {
            catSetMood("happy");
            catSpeak("Marked your territory! 💛", 2200);
            setTimeout(() => catSetMood("idle"), 2200);
          }
        }
      });
    }); // end window.addEventListener('load')
  

