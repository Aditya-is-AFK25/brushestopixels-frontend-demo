/**
 * BrushestoPixels - Core Application Engine
 * 
 * DESIGN PHILOSOPHY:
 * This web app is built entirely using vanilla JS (ES6+) and modern CSS3 features. 
 * By avoiding heavy single-page application (SPA) frameworks like React or Vue, we keep 
 * the DOM paint operations extremely fast, reduce the script load footprint to near-zero,
 * and provide a seamless, native-feeling mobile experience.
 */

/* === CORE WEB APP STATE & EVENT HANDLERS === */


    let cart = [];

    /* ── PRODUCT ENGINE: filter + sort + paginate ── */
    const PAGE_SIZE = 12;
    let currentPage = 1;
    let activeCategory = "All";
    let searchQuery = "";
    let sortMode = "default";

    function getCategories() {
      const cats = ["All", ...new Set(PRODUCTS.map((p) => p.category))];
      return cats;
    }

    function renderCategoryTabs() {
      const tabs = document.getElementById("categoryTabs");
      tabs.innerHTML = getCategories()
        .map(
          (cat) => `
      <button class="cat-tab ${cat === activeCategory ? "active" : ""}"
        onclick="setCategory('${cat}')">${cat}
      </button>
    `,
        )
        .join("");
    }

    function setCategory(cat) {
      activeCategory = cat;
      currentPage = 1;
      renderCategoryTabs();
      renderProducts();
    }

    function getFilteredProducts() {
      let list = [...PRODUCTS];

      // Category filter
      if (activeCategory !== "All") {
        list = list.filter((p) => p.category === activeCategory);
      }

      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.story.toLowerCase().includes(q) ||
            (p.material && p.material.toLowerCase().includes(q)),
        );
      }

      // Sort
      if (sortMode === "price-asc") list.sort((a, b) => a.price - b.price);
      if (sortMode === "price-desc") list.sort((a, b) => b.price - a.price);
      if (sortMode === "name-asc")
        list.sort((a, b) => a.name.localeCompare(b.name));
      if (sortMode === "new")
        list.sort((a, b) => (b.badge === "New") - (a.badge === "New"));

      return list;
    }

    function renderProducts() {
      const filtered = getFilteredProducts();
      const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
      if (currentPage > totalPages) currentPage = 1;

      const start = (currentPage - 1) * PAGE_SIZE;
      const pageItems = filtered.slice(start, start + PAGE_SIZE);

      const grid = document.getElementById("productsGrid");

      // Count
      document.getElementById("resultCount").textContent =
        filtered.length === PRODUCTS.length
          ? `${PRODUCTS.length} pieces`
          : `${filtered.length} of ${PRODUCTS.length} pieces`;

      if (pageItems.length === 0) {
        grid.innerHTML = `
        <div class="no-results">
          <div class="no-icon">🔍</div>
          <p>No pieces found</p>
          <span>Try a different category or search term</span>
        </div>`;
        document.getElementById("pagination").innerHTML = "";
        return;
      }

      grid.innerHTML = pageItems
        .map((p) => {
          const imgs = Array.isArray(p.images)
            ? p.images
            : p.images
              ? [p.images]
              : [];
          let dotsHtml = "";
          for (let i = 0; i < imgs.length; i++) {
            dotsHtml +=
              '<span class="cdot ' +
              (i === 0 ? "active" : "") +
              '" onclick="goToImage(' +
              p.id +
              "," +
              i +
              ')"></span>';
          }

          // Build image section
          let imageHtml = "";
          if (imgs.length > 0) {
            let controls = "";
            if (imgs.length > 1) {
              controls =
                '<button class="slider-btn prev" onclick="changeImage(' +
                p.id +
                ',-1)">&#10094;</button>' +
                '<button class="slider-btn next" onclick="changeImage(' +
                p.id +
                ',1)">&#10095;</button>' +
                '<div class="carousel-dots" id="dots-' +
                p.id +
                '">' +
                dotsHtml +
                "</div>";
            }
            imageHtml =
              '<div class="carousel-wrap" id="cw-' +
              p.id +
              '">' +
              '<img class="carousel-img" id="img-' +
              p.id +
              '" src="' +
              imgs[0] +
              '" alt="' +
              p.name +
              '" loading="lazy" itemprop="image" onclick="openLightbox(' +
              p.id +
              ')" style="cursor:zoom-in;" />' +
              controls +
              "</div>";
          } else {
            imageHtml =
              '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:5rem;background:linear-gradient(135deg,var(--card2),var(--card))">' +
              (p.emoji || "🎨") +
              "</div>";
          }

          // Build price HTML
          const priceHtml = p.originalPrice
            ? "&#8377;" +
            p.price.toLocaleString("en-IN") +
            "<span>&#8377;" +
            p.originalPrice.toLocaleString("en-IN") +
            "</span>"
            : "&#8377;" + p.price.toLocaleString("en-IN");

          // Build size HTML
          const sizeHtml = p.dimensions
            ? '<div style="display:flex;gap:8px;align-items:flex-start;"><span style="font-size:0.68rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--amber);font-weight:600;white-space:nowrap;padding-top:2px;">Size</span><span style="font-size:0.8rem;color:var(--cream-dim);line-height:1.5;">' +
            p.dimensions +
            "</span></div>"
            : "";

          // Build badge HTML
          const badgeHtml = p.badge
            ? '<span class="product-badge">' + p.badge + "</span>"
            : "";

          return (
            '<article class="product-card" itemscope itemtype="https://schema.org/Product">' +
            '<div class="product-image-wrap">' +
            imageHtml +
            badgeHtml +
            '<button class="product-wishlist" title="Save to wishlist" aria-label="Wishlist">&#9825;</button>' +
            "</div>" +
            '<div class="product-body">' +
            '<p class="product-category" itemprop="category">' +
            p.category +
            "</p>" +
            '<h3 class="product-name" itemprop="name">' +
            p.name +
            "</h3>" +
            '<button class="product-story-toggle" onclick="toggleStory(this)" aria-expanded="false">✦ Read its story</button>' +
            '<div class="product-story">' +
            '<div class="product-story-inner">' +
            '<p itemprop="description">"' +
            p.story +
            '"</p>' +
            '<div style="margin-top:10px;display:flex;flex-direction:column;gap:7px;">' +
            '<div style="display:flex;gap:8px;align-items:flex-start;">' +
            '<span style="font-size:0.68rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--amber);font-weight:600;white-space:nowrap;padding-top:2px;">Material</span>' +
            '<span style="font-size:0.8rem;color:var(--cream-dim);line-height:1.5;">' +
            p.material +
            "</span>" +
            "</div>" +
            sizeHtml +
            "</div>" +
            '<span style="display:inline-block;margin-top:10px;font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--sage);font-weight:600;">' +
            (p.tag || "") +
            "</span>" +
            "</div>" +
            "</div>" +
            '<div class="product-footer">' +
            '<div><div class="product-price" itemprop="price" content="' +
            p.price +
            '">' +
            priceHtml +
            "</div></div>" +
            (p.badge && p.badge.toLowerCase() === 'out of stock'
              ? '<button class="add-to-cart out-of-stock" disabled>Out of Stock</button>'
              : '<button class="add-to-cart" onclick="addToCart(this, ' + p.id + ')">+ Add to Cart</button>') +
            "</div>" +
            "</div>" +
            "</article>"
          );
        })
        .join("");

      renderPagination(totalPages);
      // Scroll grid into view smoothly on page change
      if (currentPage > 1) {
        document
          .getElementById("products")
          .scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    function renderPagination(totalPages) {
      const pag = document.getElementById("pagination");
      if (totalPages <= 1) {
        pag.innerHTML = "";
        return;
      }

      let html = "";
      html += `<button class="page-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? "disabled" : ""}>‹</button>`;

      for (let i = 1; i <= totalPages; i++) {
        if (totalPages > 7) {
          if (i !== 1 && i !== totalPages && Math.abs(i - currentPage) > 2) {
            if (i === 2 || i === totalPages - 1)
              html += `<span class="page-info">…</span>`;
            continue;
          }
        }
        html += `<button class="page-btn ${i === currentPage ? "active" : ""}" onclick="goToPage(${i})">${i}</button>`;
      }

      html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? "disabled" : ""}>›</button>`;
      html += `<span class="page-info">${currentPage} / ${totalPages}</span>`;
      pag.innerHTML = html;
    }

    function goToPage(n) {
      const filtered = getFilteredProducts();
      const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
      if (n < 1 || n > totalPages) return;
      currentPage = n;
      renderProducts();
    }

    function toggleStory(btn) {
      const story = btn.nextElementSibling;
      const open = story.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
      btn.textContent = open ? "✦ Close story" : "✦ Read its story";
    }

    /* ── CART LOGIC ── */
    function addToCart(btn, id) {
      if (typeof btn === "number") {
        id = btn;
        btn = null;
      }
      const product = PRODUCTS.find((p) => p.id === id);
      if (product && product.badge && product.badge.toLowerCase() === "out of stock") {
        showToast(`"${product.name}" is currently out of stock ⚠️`);
        return false;
      }
      const existing = cart.find((i) => i.id === id);
      if (existing) {
        existing.qty++;
      } else {
        cart.push({ ...product, qty: 1 });
      }
      updateCartUI();
      bumpBadge();
      showToast(`"${product.name}" added to cart 🛒`);

      if (btn && btn.classList) {
        const originalText = btn.innerHTML;
        btn.classList.add("btn-added");
        btn.innerHTML = "Added ✓";
        btn.disabled = true;
        setTimeout(() => {
          btn.classList.remove("btn-added");
          btn.innerHTML = originalText;
          btn.disabled = false;
        }, 1200);
      }
      return true;
    }
    const currentImages = {};

    function changeImage(productId, direction) {
      const product = PRODUCTS.find((p) => p.id === productId);
      const imgs = Array.isArray(product.images)
        ? product.images
        : [product.images];
      if (imgs.length <= 1) return;

      if (!(productId in currentImages)) currentImages[productId] = 0;
      currentImages[productId] =
        (currentImages[productId] + direction + imgs.length) % imgs.length;

      const imgEl = document.getElementById("img-" + productId);
      if (imgEl) {
        imgEl.style.opacity = "0";
        setTimeout(() => {
          imgEl.src = imgs[currentImages[productId]];
          imgEl.style.opacity = "1";
        }, 150);
      }
      updateDots(productId, currentImages[productId]);
    }

    function goToImage(productId, index) {
      const product = PRODUCTS.find((p) => p.id === productId);
      const imgs = Array.isArray(product.images)
        ? product.images
        : [product.images];
      currentImages[productId] = index;
      const imgEl = document.getElementById("img-" + productId);
      if (imgEl) {
        imgEl.style.opacity = "0";
        setTimeout(() => {
          imgEl.src = imgs[index];
          imgEl.style.opacity = "1";
        }, 150);
      }
      updateDots(productId, index);
    }

    function updateDots(productId, activeIndex) {
      const dotsEl = document.getElementById("dots-" + productId);
      if (!dotsEl) return;
      dotsEl.querySelectorAll(".cdot").forEach((d, i) => {
        d.classList.toggle("active", i === activeIndex);
      });
    }
    function removeFromCart(id) {
      cart = cart.filter((i) => i.id !== id);
      updateCartUI();
    }

    const FREE_SHIPPING_THRESHOLD = 3999;
    const SHIPPING_CHARGE = 350;

    function getSubtotal() {
      return cart.reduce((s, i) => s + i.price * i.qty, 0);
    }

    function getShipping() {
      if (cart.length === 0) return 0;
      return getSubtotal() >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;
    }

    function getTotal() {
      return getSubtotal() + getShipping();
    }

    function updateCartUI() {
      const count = cart.reduce((s, i) => s + i.qty, 0);
      document.getElementById("cartBadge").textContent = count;

      const itemsEl = document.getElementById("cartItems");
      if (cart.length === 0) {
        itemsEl.innerHTML = `<div class="cart-empty"><div class="empty-icon">🛒</div><p>Your cart is empty.<br>Discover a piece with a story.</p></div>`;
        document.getElementById("checkoutBtn").disabled = true;
      } else {
        itemsEl.innerHTML = cart
          .map(
            (i) => `
        <div class="cart-item">
          <div class="cart-item-img">${i.emoji}</div>
          <div class="cart-item-info">
            <div class="cart-item-name">${i.name}</div>
            <div class="cart-item-price">₹${(i.price * i.qty).toLocaleString("en-IN")} ${i.qty > 1 ? `<span style="color:var(--cream-dim);font-size:0.78rem">× ${i.qty}</span>` : ""}</div>
          </div>
          <button class="cart-item-remove" onclick="removeFromCart(${i.id})" aria-label="Remove item">✕</button>
        </div>
      `,
          )
          .join("");
        document.getElementById("checkoutBtn").disabled = false;
      }

      const subtotal = getSubtotal();
      const shipping = getShipping();
      const grandTotal = getTotal();
      const shippingRow = document.getElementById("cartShippingRow");
      const shippingAmt = document.getElementById("cartShippingAmt");
      if (shippingRow && shippingAmt) {
        shippingRow.style.display = cart.length === 0 ? "none" : "flex";
        if (shipping === 0) {
          shippingAmt.innerHTML =
            '<span style="color:#4CAF50;font-weight:600;">FREE</span>';
        } else {
          const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
          shippingAmt.innerHTML =
            "₹" +
            shipping.toLocaleString("en-IN") +
            '<span style="display:block;font-size:0.7rem;color:var(--sage);margin-top:2px;">Add ₹' +
            remaining.toLocaleString("en-IN") +
            " more for free shipping</span>";
        }
      }
      document.getElementById("cartTotal").textContent =
        "₹" + grandTotal.toLocaleString("en-IN");
    }

    function bumpBadge() {
      const badge = document.getElementById("cartBadge");
      badge.classList.remove("bump");
      void badge.offsetWidth;
      badge.classList.add("bump");
    }

    /* ── CART SIDEBAR OPEN/CLOSE ── */
    document.getElementById("cartBtn").onclick = () => openCart();
    document.getElementById("cartOverlay").onclick = () => closeCart();
    document.getElementById("closeCart").onclick = () => closeCart();

    function openCart() {
      document.getElementById("cartSidebar").classList.add("open");
      document.getElementById("cartOverlay").classList.add("open");
      document.body.style.overflow = "hidden";
    }

    function closeCart() {
      document.getElementById("cartSidebar").classList.remove("open");
      document.getElementById("cartOverlay").classList.remove("open");
      document.body.style.overflow = "";
    }

    /* ── CHECKOUT ── */
    document.getElementById("checkoutBtn").onclick = () => {
      closeCart();
      openCheckout();
    };

    document.getElementById("cancelCheckout").onclick = () => closeCheckout();

    function openCheckout() {
      const overlay = document.getElementById("checkoutModal");
      // populate summary
      document.getElementById("modalSummaryItems").innerHTML = cart
        .map(
          (i) =>
            '<div class="summary-item"><span>' +
            i.name +
            " × " +
            i.qty +
            "</span><span>₹" +
            (i.price * i.qty).toLocaleString("en-IN") +
            "</span></div>",
        )
        .join("");
      const shipping = getShipping();
      const modalShipEl = document.getElementById("modalShipping");
      const modalShipRow = document.getElementById("modalShippingRow");
      if (modalShipEl && modalShipRow) {
        modalShipEl.textContent =
          shipping === 0 ? "FREE" : "₹" + shipping.toLocaleString("en-IN");
        modalShipEl.style.color = shipping === 0 ? "#4CAF50" : "var(--cream)";
        modalShipRow.style.display = "flex";
      }
      document.getElementById("modalTotal").textContent =
        "₹" + getTotal().toLocaleString("en-IN");
      overlay.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    function closeCheckout() {
      document.getElementById("checkoutModal").classList.remove("open");
      document.body.style.overflow = "";
    }

    document.getElementById("placeOrderBtn").onclick = () =>
      startRazorpayPayment();

    async function startRazorpayPayment() {
      /* ── Step 1: Validate form BEFORE opening Razorpay ── */
      const fname = document.getElementById("fname").value.trim();
      const lname = document.getElementById("lname").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const address = document.getElementById("address").value.trim();
      const city = document.getElementById("city").value.trim();
      const pincode = document.getElementById("pincode").value.trim();

      if (
        !fname ||
        !lname ||
        !email ||
        !phone ||
        !address ||
        !city ||
        !pincode
      ) {
        showToast("Please fill in all required fields ⚠️");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast("Please enter a valid email address");
        return;
      }

      /* ── Step 2: Show loading state ── */
      const btn = document.getElementById("placeOrderBtn");
      btn.textContent = "Opening Payment...";
      btn.disabled = true;

      try {
        /* ── Step 3: Create Razorpay order via backend ── */
        const response = await fetch(
          "https://YOUR_BACKEND_ORDER_CREATION_URL/api/create-order",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: getTotal() }),
          },
        );

        if (!response.ok) throw new Error("Failed to create order");
        const order = await response.json();

        /* ── Step 4: Open Razorpay checkout ── */
        const options = {
          key: "YOUR_RAZORPAY_PUBLIC_KEY_ID",
          amount: order.amount,
          currency: order.currency,
          order_id: order.id,
          name: "BrushestoPixels",
          description: "Handcrafted Home Decor",
          image: "https://brushestopixels.in/favicon.jpeg",
          prefill: {
            name: fname + " " + lname,
            email: email,
            contact: phone,
          },
          theme: { color: "#C8651B" },

          /* ── Step 5: Only on successful payment → confirm order & send email ── */
          handler: function (razorpayResponse) {
            console.log("✦ Payment Successful", razorpayResponse);
            placeOrder({
              fname,
              lname,
              email,
              phone,
              address,
              city,
              pincode,
              razorpayPaymentId: razorpayResponse.razorpay_payment_id,
            });
          },

          modal: {
            ondismiss: function () {
              showToast("Payment cancelled. Your cart is still saved.");
              btn.textContent = "Place Order & Pay →";
              btn.disabled = false;
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (resp) {
          showToast("Payment failed: " + resp.error.description);
          btn.textContent = "Place Order & Pay →";
          btn.disabled = false;
        });
        rzp.open();
      } catch (err) {
        console.error(err);
        showToast("Something went wrong. Please try again.");
        btn.textContent = "Place Order & Pay →";
        btn.disabled = false;
      }
    }

    let pendingWhatsAppUrl = null;

    function placeOrder({
      fname,
      lname,
      email,
      phone,
      address,
      city,
      pincode,
      razorpayPaymentId,
    }) {
      const orderId = "BTP-" + Math.floor(100000 + Math.random() * 900000);
      const orderData = {
        orderId,
        customer: `${fname} ${lname}`,
        email,
        phone,
        address: `${address}, ${city} - ${pincode}`,
        items: [...cart],
        total: getTotal(),
        date: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        razorpayPaymentId,
      };

      sendConfirmationEmail(orderData);
      saveOrderToSheet(orderData);
      sendWhatsAppNotification(orderData);

      closeCheckout();
      document.getElementById("orderIdPill").textContent =
        `ORDER #${orderId}`;
      document.getElementById("successModal").classList.add("open");
      document.body.style.overflow = "hidden";

      /* Reset button */
      const btn = document.getElementById("placeOrderBtn");
      btn.textContent = "Place Order & Pay →";
      btn.disabled = false;

      cart = [];
      updateCartUI();
    }

    document.getElementById("closeSuccess").onclick = () => {
      document.getElementById("successModal").classList.remove("open");
      document.body.style.overflow = "";
      if (pendingWhatsAppUrl) {
        window.open(pendingWhatsAppUrl, "_blank");
        pendingWhatsAppUrl = null;
      }
    };

    /* ── EMAIL CONFIRMATION via EmailJS ── */
    function sendConfirmationEmail(order) {
      // ── Email 1: Confirmation to customer ──
      emailjs
        .send("YOUR_EMAILJS_SERVICE_ID", "YOUR_EMAILJS_TEMPLATE_ID", {
          to_email: order.email,
          customer_name: order.customer,
          order_id: order.orderId,
          order_total: "₹" + order.total.toLocaleString("en-IN"),
          order_items: order.items
            .map((i) => i.name + " × " + i.qty)
            .join(", "),
          shipping_address: order.address,
          order_date: order.date,
        })
        .then(
          function (response) {
            console.log(
              "✦ Customer confirmation email sent!",
              response.status,
              response.text,
            );
          },
          function (error) {
            console.error("❌ Customer email send failed:", error);
          },
        );

      // ── Email 2: Order alert to owner ──
      emailjs
        .send("YOUR_EMAILJS_SERVICE_ID", "YOUR_EMAILJS_TEMPLATE_ID", {
          to_email: "your-email@example.com",
          customer_name: "🐯 New Order Alert",
          order_id: order.orderId,
          order_total: "₹" + order.total.toLocaleString("en-IN"),
          order_items: order.items
            .map(
              (i) =>
                i.name +
                " × " +
                i.qty +
                " — ₹" +
                (i.price * i.qty).toLocaleString("en-IN"),
            )
            .join(", "),
          shipping_address:
            order.address +
            " | Customer: " +
            order.customer +
            " | Phone: " +
            order.phone +
            " | Email: " +
            order.email +
            " | Payment ID: " +
            (order.razorpayPaymentId || "N/A"),
          order_date: order.date,
        })
        .then(
          function (response) {
            console.log(
              "✦ Owner notification email sent!",
              response.status,
              response.text,
            );
          },
          function (error) {
            console.error("❌ Owner notification email send failed:", error);
          },
        );
    }

    function saveOrderToSheet(order) {
      const SHEET_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL";
      fetch(SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.orderId,
          date: order.date,
          customer: order.customer,
          email: order.email,
          phone: order.phone,
          address: order.address,
          items: order.items.map(i => i.name + " x " + i.qty).join(", "),
          total: "₹" + order.total.toLocaleString("en-IN"),
          paymentId: order.razorpayPaymentId || "N/A"
        })
      }).then(() => {
        console.log("✦ Order saved to sheet");
      }).catch((err) => {
        console.error("❌ Sheet save failed:", err);
      });
    }

    /* ── WHATSAPP ORDER NOTIFICATION ── */
    function sendWhatsAppNotification(order) {
      const YOUR_WHATSAPP_NUMBER = "919829774933";

      const itemsList = order.items
        .map(
          (i) =>
            `  • ${i.name} × ${i.qty} — ₹${(i.price * i.qty).toLocaleString("en-IN")}`,
        )
        .join("\n");

      const message = `✦ *New Order — BrushestoPixels* ✦

*Order ID:* ${order.orderId}
*Date:* ${order.date}
*Payment ID:* ${order.razorpayPaymentId || "N/A"}

*Customer:* ${order.customer}
*Phone:* ${order.phone}
*Email:* ${order.email}

*Items Ordered:*
${itemsList}

*Order Total:* ₹${order.total.toLocaleString("en-IN")}

*Ship To:*
${order.address}`;

      const encoded = encodeURIComponent(message);
      pendingWhatsAppUrl = `https://wa.me/${YOUR_WHATSAPP_NUMBER}?text=${encoded}`;
    }

    /* ── TOAST ── */
    function showToast(msg) {
      const wrap = document.getElementById("toastWrap");
      const toast = document.createElement("div");
      toast.className = "toast";
      toast.textContent = msg;
      wrap.appendChild(toast);
      setTimeout(() => toast.remove(), 3800);
    }

    /* ── SCROLL REVEAL ── */
    function initReveal() {
      const els = document.querySelectorAll(".reveal");
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("visible");
              obs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.1 },
      );
      els.forEach((el) => obs.observe(el));
    }

    /* ── NAV SCROLL ── */
    window.addEventListener("scroll", () => {
      document
        .getElementById("navbar")
        .classList.toggle("scrolled", window.scrollY > 60);
    });

    /* ── WISHLIST HEARTS ── */
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("product-wishlist")) {
        const btn = e.target;
        const isActivating = btn.textContent === "♡";
        btn.textContent = isActivating ? "♥" : "♡";
        btn.style.color = isActivating ? "var(--amber)" : "";

        if (isActivating) {
          btn.classList.remove("heart-active");
          void btn.offsetWidth; // Trigger reflow to restart animation
          btn.classList.add("heart-active");
        } else {
          btn.classList.remove("heart-active");
        }
      }
    });

    /* ── INIT ── */
    renderCategoryTabs();
    renderProducts();
    updateCartUI();
    initReveal();

    /* ── SEARCH ── */
    let searchTimer;
    document
      .getElementById("productSearch")
      .addEventListener("input", function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          searchQuery = this.value.trim();
          currentPage = 1;
          renderProducts();
        }, 280);
      });

    /* ── SORT ── */
    document
      .getElementById("sortSelect")
      .addEventListener("change", function () {
        sortMode = this.value;
        currentPage = 1;
        renderProducts();
      });



/* === LIGHTBOX & SWIPE ACTIONS === */
  
    /* ── LIGHTBOX with full mobile swipe support ── */
    let lbImages = [];
    let lbIndex = 0;

    function openLightbox(productId, startIndex) {
      const product = PRODUCTS.find((p) => p.id === productId);
      lbImages = Array.isArray(product.images)
        ? product.images
        : [product.images];
      lbIndex =
        startIndex !== undefined ? startIndex : currentImages[productId] || 0;
      showLbImage();
      const lb = document.getElementById("lightbox");
      lb.style.display = "flex";
      document.body.style.overflow = "hidden";
      // hide swipe hint after 2s
      setTimeout(() => {
        const hint = document.getElementById("lbSwipeHint");
        if (hint) hint.style.opacity = "0";
      }, 2000);
    }

    function showLbImage() {
      const img = document.getElementById("lbImg");
      img.style.opacity = "0";
      setTimeout(() => {
        img.src = lbImages[lbIndex];
        img.style.opacity = "1";
        img.style.transition = "opacity 0.2s ease";
      }, 100);

      // counter
      document.getElementById("lbCounter").textContent =
        lbImages.length > 1 ? lbIndex + 1 + " / " + lbImages.length : "";

      // dots
      const dotsEl = document.getElementById("lbDots");
      dotsEl.innerHTML =
        lbImages.length > 1
          ? lbImages
            .map(function (_, i) {
              return (
                '<span onclick="event.stopPropagation();lbGoTo(' +
                i +
                ')" style="width:10px;height:10px;border-radius:50%;background:' +
                (i === lbIndex ? "#C8651B" : "rgba(245,237,214,0.3)") +
                ';cursor:pointer;transition:background 0.2s;display:inline-block;-webkit-tap-highlight-color:transparent;"></span>'
              );
            })
            .join("")
          : "";

      // arrows — hide on single image
      const showArrows = lbImages.length > 1;
      document.getElementById("lbPrev").style.display = showArrows
        ? "flex"
        : "none";
      document.getElementById("lbNext").style.display = showArrows
        ? "flex"
        : "none";

      // swipe hint — only show if multiple images
      const hint = document.getElementById("lbSwipeHint");
      if (hint) hint.style.display = lbImages.length > 1 ? "block" : "none";
    }

    function lbGoTo(i) {
      lbIndex = i;
      showLbImage();
    }

    function closeLightbox() {
      document.getElementById("lightbox").style.display = "none";
      document.body.style.overflow = "";
      lbImages = [];
    }

    // Close button
    document
      .getElementById("lbClose")
      .addEventListener("click", function (e) {
        e.stopPropagation();
        closeLightbox();
      });

    // Prev / Next buttons
    document.getElementById("lbPrev").addEventListener("click", function (e) {
      e.stopPropagation();
      lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
      showLbImage();
    });
    document.getElementById("lbNext").addEventListener("click", function (e) {
      e.stopPropagation();
      lbIndex = (lbIndex + 1) % lbImages.length;
      showLbImage();
    });

    // Keyboard
    document.addEventListener("keydown", function (e) {
      if (document.getElementById("lightbox").style.display !== "flex")
        return;
      if (e.key === "ArrowRight") {
        lbIndex = (lbIndex + 1) % lbImages.length;
        showLbImage();
      }
      if (e.key === "ArrowLeft") {
        lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
        showLbImage();
      }
      if (e.key === "Escape") closeLightbox();
    });

    /* ── SWIPE to browse in lightbox ── */
    var lbTouchStartX = 0;
    var lbTouchStartY = 0;

    document.getElementById("lbImgWrap").addEventListener(
      "touchstart",
      function (e) {
        lbTouchStartX = e.touches[0].clientX;
        lbTouchStartY = e.touches[0].clientY;
      },
      { passive: true },
    );

    document.getElementById("lbImgWrap").addEventListener(
      "touchend",
      function (e) {
        var dx = e.changedTouches[0].clientX - lbTouchStartX;
        var dy = e.changedTouches[0].clientY - lbTouchStartY;
        // only count horizontal swipes (not scrolls)
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
          if (dx < 0) {
            lbIndex = (lbIndex + 1) % lbImages.length;
          } else {
            lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
          }
          showLbImage();
        } else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
          // tap (not swipe) — close
          closeLightbox();
        }
      },
      { passive: true },
    );

    /* ── SWIPE on product carousel cards ── */
    document.addEventListener(
      "touchstart",
      function (e) {
        var card = e.target.closest(".carousel-wrap");
        if (!card) return;
        card._touchX = e.touches[0].clientX;
        card._touchY = e.touches[0].clientY;
      },
      { passive: true },
    );

    document.addEventListener(
      "touchend",
      function (e) {
        var card = e.target.closest(".carousel-wrap");
        if (!card || card._touchX === undefined || card._touchY === undefined)
          return;
        var dx = e.changedTouches[0].clientX - card._touchX;
        var dy = e.changedTouches[0].clientY - card._touchY;

        // Only change image if it's primarily a horizontal swipe and meets the threshold
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
          var pid = parseInt(card.id.replace("cw-", ""));
          if (!isNaN(pid)) changeImage(pid, dx < 0 ? 1 : -1);
        }

        card._touchX = undefined;
        card._touchY = undefined;
      },
      { passive: true },
    );
  


/* === JUST DROPPED HOME ROW === */
    
      (function () {
        const renderJustDropped = () => {
          if (typeof PRODUCTS === 'undefined') return;

          // Target IDs: The Grey Heron Lamp (23), The Safari Siesta Collection (8), The Apex Wilderness Tumbler (35)
          const targetIds = [23, 8, 35];
          const selected = targetIds.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);

          const grid = document.getElementById('justDroppedGrid');
          if (grid) {
            grid.innerHTML = selected.map(p => {
              const priceHtml = p.originalPrice
                ? `&#8377;${p.price.toLocaleString("en-IN")} <span>&#8377;${p.originalPrice.toLocaleString("en-IN")}</span>`
                : `&#8377;${p.price.toLocaleString("en-IN")}`;

              const badgeHtml = p.badge
                ? `<span class="product-badge">${p.badge}</span>`
                : '';

              return `
                <article class="just-dropped-card reveal">
                  <div class="product-image-wrap">
                    <div class="carousel-wrap">
                      <img class="carousel-img" src="${p.images[0]}" alt="${p.name}" loading="lazy" />
                    </div>
                    ${badgeHtml}
                  </div>
                  <div class="just-dropped-body">
                    <p class="just-dropped-category">${p.category}</p>
                    <h3 class="just-dropped-name">${p.name}</h3>
                    <div class="just-dropped-footer">
                      <div class="just-dropped-price">${priceHtml}</div>
                      <button class="add-to-cart" onclick="addToCart(this, ${p.id})">+ Add to Cart</button>
                    </div>
                  </div>
                </article>
              `;
            }).join('');

            // Set up a self-contained IntersectionObserver to stagger reveal animation
            const observer = new IntersectionObserver((entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  entry.target.classList.add('visible');
                  observer.unobserve(entry.target);
                }
              });
            }, { threshold: 0.1 });

            grid.querySelectorAll('.reveal').forEach(el => observer.observe(el));
          }
        };

        // Initialize when DOM is ready or run immediately if ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', renderJustDropped);
        } else {
          renderJustDropped();
        }
      })();
    

