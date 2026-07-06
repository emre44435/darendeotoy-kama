(function ($) {
  "use strict";

  const WHATSAPP_PHONE = "905452838133";
  const MOBILE_BREAKPOINT = 992;
  const HEADER_OFFSET = 78;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let ticking = false;
  let resizeTimer = null;

  function isMobile() {
    return window.innerWidth < MOBILE_BREAKPOINT;
  }

  function setHeaderState() {
    if ($(window).scrollTop() > 30) {
      $(".site-header").addClass("scrolled");
    } else {
      $(".site-header").removeClass("scrolled");
    }
  }

  function setActiveMenu() {
    const scrollPos = $(window).scrollTop() + 130;
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
      $heroBg.css("transform", "none");
      return;
    }

    const scrolled = $(window).scrollTop();
    const speed = parseFloat($heroBg.data("speed")) || 0.15;
    const maxScroll = $(window).height() + 140;

    if (scrolled < maxScroll) {
      $heroBg.css(
        "transform",
        "translate3d(0," + scrolled * speed + "px,0) scale(1.04)"
      );
    }
  }

  function revealOnScroll() {
    const windowBottom = $(window).scrollTop() + $(window).height() * 0.88;

    $(".reveal").each(function () {
      const $item = $(this);

      if ($item.hasClass("visible")) return;

      if ($item.offset().top < windowBottom) {
        $item.addClass("visible");
      }
    });
  }

  function runCounters() {
    $("[data-counter]").each(function () {
      const $this = $(this);

      if ($this.data("counted")) return;

      const triggerPoint = $(window).scrollTop() + $(window).height() * 0.92;

      if ($this.offset().top > triggerPoint) return;

      $this.data("counted", true);

      const target = parseInt($this.attr("data-counter"), 10);

      if (Number.isNaN(target)) return;

      $({ countNum: 0 }).animate(
        { countNum: target },
        {
          duration: prefersReducedMotion ? 1 : 1200,
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
  }

  function backToTopState() {
    if ($(window).scrollTop() > 550) {
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
    }
  }

  function buildWhatsappMessage() {
    const name = $.trim($("#name").val());
    const phone = $.trim($("#phone").val());
    const service = $("#service").val();
    const date = $("#date").val();
    const message = $.trim($("#message").val());

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

    const targetTop = $target.offset().top - HEADER_OFFSET;

    $("html, body").stop().animate(
      {
        scrollTop: Math.max(targetTop, 0)
      },
      prefersReducedMotion ? 1 : 650,
      "swing"
    );
  }

  function openGalleryModal(src, alt) {
    const $modal = $(".gallery-modal");
    const $modalImg = $(".gallery-modal img");

    if (!$modal.length || !$modalImg.length) return;

    $modalImg.attr("src", src).attr("alt", alt || "Diamond galeri görseli");
    $modal.css("display", "flex").hide().fadeIn(180).attr("aria-hidden", "false");
    $("body").addClass("no-scroll");
  }

  function closeGalleryModal() {
    const $modal = $(".gallery-modal");

    if (!$modal.length) return;

    $modal.fadeOut(180, function () {
      $(".gallery-modal img").attr("src", "");
    });

    $modal.attr("aria-hidden", "true");
    $("body").removeClass("no-scroll");
  }

  function initCookieBox() {
    if (localStorage.getItem("diamondCookieAccepted") !== "yes") {
      setTimeout(function () {
        $(".cookie-box").fadeIn(220);
      }, 900);
    }

    $("#cookieAccept").on("click", function () {
      localStorage.setItem("diamondCookieAccepted", "yes");
      $(".cookie-box").fadeOut(220);
    });
  }

  function initAppointmentForm() {
    $("#appointmentForm").on("submit", function (event) {
      event.preventDefault();

      const name = $.trim($("#name").val());
      const phone = $.trim($("#phone").val());
      const service = $("#service").val();
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

      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  function initGallery() {
    $(".gallery-item").on("click", function (event) {
      event.preventDefault();

      const src = $(this).attr("href");
      const alt = $(this).find("img").attr("alt") || "Diamond galeri görseli";

      if (!src) return;

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

    $(document).on("keyup", function (event) {
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
        prefersReducedMotion ? 1 : 650
      );
    });
  }

  function initResizeHandler() {
    $(window).on("resize orientationchange", function () {
      clearTimeout(resizeTimer);

      resizeTimer = setTimeout(function () {
        parallaxHero();
        setActiveMenu();
      }, 180);
    });
  }

  $(window).on("load", function () {
    setTimeout(function () {
      $(".page-loader").addClass("loaded");
    }, 250);

    runScrollTasks();
  });

  $(document).ready(function () {
    $("#year").text(new Date().getFullYear());

    runScrollTasks();

    $(window).on("scroll", requestScrollUpdate);

    initNavigation();
    initGallery();
    initAppointmentForm();
    initCookieBox();
    initResizeHandler();
  });
})(jQuery);