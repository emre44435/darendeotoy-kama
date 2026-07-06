(function ($) {
  "use strict";

  const WHATSAPP_PHONE = "905452838133";
  const MOBILE_BREAKPOINT = 992;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let ticking = false;
  let resizeTimer = null;
  let counterStarted = false;

  const $window = $(window);
  const $document = $(document);
  const $body = $("body");

  function isMobile() {
    return window.innerWidth < MOBILE_BREAKPOINT;
  }

  function getHeaderOffset() {
    const headerHeight = $(".site-header").outerHeight() || 76;
    return headerHeight + 12;
  }

  function safeGetStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeSetStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      return false;
    }

    return true;
  }

  function setHeaderState() {
    if ($window.scrollTop() > 24) {
      $(".site-header").addClass("scrolled");
    } else {
      $(".site-header").removeClass("scrolled");
    }
  }

  function setActiveMenu() {
    const scrollPos = $window.scrollTop() + getHeaderOffset() + 55;
    let currentId = "home";

    $("main section[id]").each(function () {
      const $section = $(this);
      const id = $section.attr("id");
      const top = $section.offset().top;
      const bottom = top + $section.outerHeight();

      if (scrollPos >= top && scrollPos < bottom) {
        currentId = id;
      }
    });

    $(".navbar .nav-link").removeClass("active");
    $('.navbar .nav-link[href="#' + currentId + '"]').addClass("active");
  }

  function parallaxHero() {
    const $heroBg = $(".hero-bg");

    if (!$heroBg.length) return;

    if (isMobile() || prefersReducedMotion) {
      $heroBg.css({
        transform: "none",
        willChange: "auto"
      });
      return;
    }

    const scrolled = $window.scrollTop();
    const speed = parseFloat($heroBg.data("speed")) || 0.15;
    const maxScroll = $window.height() + 160;

    if (scrolled < maxScroll) {
      $heroBg.css({
        transform: "translate3d(0," + scrolled * speed + "px,0) scale(1.04)",
        willChange: "transform"
      });
    } else {
      $heroBg.css("willChange", "auto");
    }
  }

  function revealOnScroll() {
    if (prefersReducedMotion) {
      $(".reveal").addClass("visible");
      return;
    }

    const windowBottom = $window.scrollTop() + $window.height() * 0.9;

    $(".reveal").each(function () {
      const $item = $(this);

      if ($item.hasClass("visible")) return;

      if ($item.offset().top < windowBottom) {
        $item.addClass("visible");
      }
    });
  }

  function runCounters() {
    if (counterStarted) return;

    const $counters = $("[data-counter]");
    if (!$counters.length) return;

    $counters.each(function () {
      const $this = $(this);

      if ($this.data("counted")) return;

      const triggerPoint = $window.scrollTop() + $window.height() * 0.92;

      if ($this.offset().top > triggerPoint) return;

      $this.data("counted", true);

      const target = parseInt($this.attr("data-counter"), 10);

      if (Number.isNaN(target)) return;

      $({ countNum: 0 }).animate(
        { countNum: target },
        {
          duration: prefersReducedMotion ? 1 : 1100,
          easing: "swing",
          step: function () {
            const value = Math.floor(this.countNum);
            $this.text(target === 100 ? "%" + value : value);
          },
          complete: function () {
            $this.text(target === 100 ? "%" + target : target);
          }
        }
      );
    });

    const completed = $counters.filter(function () {
      return $(this).data("counted") === true;
    }).length;

    if (completed === $counters.length) {
      counterStarted = true;
    }
  }

  function backToTopState() {
    if ($window.scrollTop() > 520) {
      $(".back-to-top").addClass("show");
    } else {
      $(".back-to-top").removeClass("show");
    }
  }

  function closeMobileMenu() {
    const navbar = document.getElementById("mainNavbar");

    if (!navbar || !navbar.classList.contains("show")) return;

    if (typeof bootstrap !== "undefined" && bootstrap.Collapse) {
      bootstrap.Collapse.getOrCreateInstance(navbar).hide();
    } else {
      $(navbar).removeClass("show");
      $('.navbar-toggler[aria-controls="mainNavbar"]').attr("aria-expanded", "false");
    }
  }

  function cleanText(value) {
    return $.trim(String(value || "").replace(/\s+/g, " "));
  }

  function buildWhatsappMessage() {
    const name = cleanText($("#name").val());
    const phone = cleanText($("#phone").val());
    const service = cleanText($("#service").val());
    const date = cleanText($("#date").val());
    const message = cleanText($("#message").val());

    return [
      "Merhaba Diamond Oto ve Halı Yıkama, randevu almak istiyorum.",
      "",
      "Ad Soyad: " + name,
      "Telefon: " + phone,
      "Hizmet: " + service,
      date ? "Tarih: " + date : "Tarih: Belirtilecek",
      message ? "Not: " + message : "Not: -"
    ].join("\n");
  }

  function runScrollTasks() {
    setHeaderState();
    setActiveMenu();
    parallaxHero();
    revealOnScroll();
    backToTopState();
    runCounters();
  }

  function requestScrollUpdate() {
    if (ticking) return;

    ticking = true;

    window.requestAnimationFrame(function () {
      runScrollTasks();
      ticking = false;
    });
  }

  function smoothScrollTo(target) {
    const $target = $(target);

    if (!$target.length) return;

    const targetTop = $target.offset().top - getHeaderOffset();

    $("html, body").stop().animate(
      {
        scrollTop: Math.max(targetTop, 0)
      },
      prefersReducedMotion ? 1 : 620,
      "swing"
    );
  }

  function openGalleryModal(src, alt) {
    const $modal = $(".gallery-modal");
    const $modalImg = $(".gallery-modal img");

    if (!$modal.length || !$modalImg.length || !src) return;

    $modalImg.attr({
      src: src,
      alt: alt || "Diamond galeri görseli"
    });

    $modal
      .css("display", "flex")
      .hide()
      .fadeIn(prefersReducedMotion ? 1 : 180)
      .attr("aria-hidden", "false");

    $body.addClass("no-scroll");
  }

  function closeGalleryModal() {
    const $modal = $(".gallery-modal");

    if (!$modal.length || $modal.attr("aria-hidden") === "true") return;

    $modal.fadeOut(prefersReducedMotion ? 1 : 180, function () {
      $(".gallery-modal img").attr({
        src: "",
        alt: "Galeri büyük görsel"
      });

      $modal.attr("aria-hidden", "true");
    });

    $body.removeClass("no-scroll");
  }

  function initCookieBox() {
    const $cookieBox = $(".cookie-box");
    const $cookieButton = $("#cookieAccept");

    if (!$cookieBox.length || !$cookieButton.length) return;

    if (safeGetStorage("diamondCookieAccepted") !== "yes") {
      setTimeout(function () {
        $cookieBox.fadeIn(prefersReducedMotion ? 1 : 220);
      }, 900);
    }

    $cookieButton.on("click", function () {
      safeSetStorage("diamondCookieAccepted", "yes");
      $cookieBox.fadeOut(prefersReducedMotion ? 1 : 220);
    });
  }

  function initAppointmentForm() {
    const $form = $("#appointmentForm");

    if (!$form.length) return;

    $form.on("submit", function (event) {
      event.preventDefault();

      const name = cleanText($("#name").val());
      const phone = cleanText($("#phone").val());
      const service = cleanText($("#service").val());
      const $messageBox = $(".form-message");

      if (!name || !phone || !service) {
        $messageBox
          .removeClass("success")
          .addClass("error")
          .text("Lütfen ad soyad, telefon ve hizmet seçimi alanlarını doldurun.");

        return;
      }

      const text = encodeURIComponent(buildWhatsappMessage());
      const url = "https://wa.me/" + WHATSAPP_PHONE + "?text=" + text;

      $messageBox
        .removeClass("error")
        .addClass("success")
        .text("WhatsApp açılıyor, randevu mesajınız hazırlandı.");

      const newWindow = window.open(url, "_blank", "noopener,noreferrer");

      if (newWindow) {
        newWindow.opener = null;
      }
    });
  }

  function initGallery() {
    $(".gallery-item").on("click", function (event) {
      event.preventDefault();

      const src = $(this).attr("href");
      const alt = $(this).find("img").attr("alt") || "Diamond galeri görseli";

      openGalleryModal(src, alt);
    });

    $(".gallery-close").on("click", function (event) {
      event.preventDefault();
      closeGalleryModal();
    });

    $(".gallery-modal").on("click", function (event) {
      if ($(event.target).is(".gallery-modal")) {
        closeGalleryModal();
      }
    });

    $document.on("keyup", function (event) {
      if (event.key === "Escape") {
        closeGalleryModal();
      }
    });
  }

  function initNavigation() {
    $("a[href^='#']").on("click", function (event) {
      const href = $(this).attr("href");

      if (!href || href === "#") return;

      const $target = $(href);

      if (!$target.length) return;

      event.preventDefault();
      smoothScrollTo(href);
      closeMobileMenu();
    });

    $(".back-to-top").on("click", function () {
      $("html, body").stop().animate(
        { scrollTop: 0 },
        prefersReducedMotion ? 1 : 620,
        "swing"
      );
    });
  }

  function initResizeHandler() {
    $window.on("resize orientationchange", function () {
      clearTimeout(resizeTimer);

      resizeTimer = setTimeout(function () {
        parallaxHero();
        setActiveMenu();
        revealOnScroll();
      }, 180);
    });
  }

  function initPassiveScroll() {
    window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  }

  function initPageLoader() {
    setTimeout(function () {
      $(".page-loader").addClass("loaded");
    }, 250);

    setTimeout(function () {
      $(".page-loader").remove();
    }, 900);
  }

  $window.on("load", function () {
    initPageLoader();
    runScrollTasks();
  });

  $(document).ready(function () {
    $("#year").text(new Date().getFullYear());

    runScrollTasks();

    initPassiveScroll();
    initNavigation();
    initGallery();
    initAppointmentForm();
    initCookieBox();
    initResizeHandler();
  });
})(jQuery);