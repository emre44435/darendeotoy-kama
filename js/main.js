(function ($) {
  "use strict";

  const WHATSAPP_PHONE = "905452838133";

  function setHeaderState() {
    if ($(window).scrollTop() > 30) {
      $(".site-header").addClass("scrolled");
    } else {
      $(".site-header").removeClass("scrolled");
    }
  }

  function setActiveMenu() {
    const scrollPos = $(window).scrollTop() + 120;
    $("main section[id], #home").each(function () {
      const id = $(this).attr("id");
      const top = $(this).offset().top;
      const bottom = top + $(this).outerHeight();
      if (scrollPos >= top && scrollPos <= bottom) {
        $(".navbar .nav-link").removeClass("active");
        $('.navbar .nav-link[href="#' + id + '"]').addClass("active");
      }
    });
  }

  function parallaxHero() {
    const scrolled = $(window).scrollTop();
    const speed = parseFloat($(".hero-bg").data("speed")) || 0.15;
    if (scrolled < $(window).height() + 120) {
      $(".hero-bg").css("transform", "translate3d(0," + scrolled * speed + "px,0) scale(1.06)");
    }
  }

  function revealOnScroll() {
    const windowBottom = $(window).scrollTop() + $(window).height() * 0.88;
    $(".reveal").each(function () {
      if ($(this).offset().top < windowBottom) {
        $(this).addClass("visible");
      }
    });
  }

  function runCounters() {
    $("[data-counter]").each(function () {
      const $this = $(this);
      if ($this.data("counted")) return;
      if ($this.offset().top > $(window).scrollTop() + $(window).height() * 0.92) return;

      $this.data("counted", true);
      const target = parseInt($this.attr("data-counter"), 10);
      $({ countNum: 0 }).animate(
        { countNum: target },
        {
          duration: 1200,
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
    if (navbar && navbar.classList.contains("show")) {
      bootstrap.Collapse.getOrCreateInstance(navbar).hide();
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

  $(window).on("load", function () {
    setTimeout(function () {
      $(".page-loader").addClass("loaded");
    }, 250);
    revealOnScroll();
  });

  $(document).ready(function () {
    $("#year").text(new Date().getFullYear());

    setHeaderState();
    setActiveMenu();
    revealOnScroll();
    backToTopState();
    runCounters();

    $(window).on("scroll", function () {
      setHeaderState();
      setActiveMenu();
      parallaxHero();
      revealOnScroll();
      backToTopState();
      runCounters();
    });

    $(window).on("resize", function () {
      parallaxHero();
    });

    $("a[href^='#']").on("click", function (event) {
      const target = $(this.getAttribute("href"));
      if (target.length) {
        event.preventDefault();
        $("html, body").stop().animate(
          { scrollTop: target.offset().top - 72 },
          650,
          "swing"
        );
        closeMobileMenu();
      }
    });

    $(".back-to-top").on("click", function () {
      $("html, body").animate({ scrollTop: 0 }, 650);
    });

    $(".gallery-item").on("click", function (event) {
      event.preventDefault();
      const src = $(this).attr("href");
      const alt = $(this).find("img").attr("alt") || "Diamond galeri görseli";
      $(".gallery-modal img").attr("src", src).attr("alt", alt);
      $(".gallery-modal").css("display", "flex").hide().fadeIn(180).attr("aria-hidden", "false");
      $("body").addClass("no-scroll");
    });

    $(".gallery-close, .gallery-modal").on("click", function (event) {
      if ($(event.target).is(".gallery-modal") || $(event.currentTarget).is(".gallery-close")) {
        $(".gallery-modal").fadeOut(180).attr("aria-hidden", "true");
        $("body").removeClass("no-scroll");
      }
    });

    $(document).on("keyup", function (event) {
      if (event.key === "Escape") {
        $(".gallery-modal").fadeOut(180).attr("aria-hidden", "true");
        $("body").removeClass("no-scroll");
      }
    });

    $("#appointmentForm").on("submit", function (event) {
      event.preventDefault();
      const name = $.trim($("#name").val());
      const phone = $.trim($("#phone").val());
      const service = $("#service").val();
      const $messageBox = $(".form-message");

      if (!name || !phone || !service) {
        $messageBox.removeClass("success").addClass("error").text("Lütfen ad soyad, telefon ve hizmet seçimi alanlarını doldurun.");
        return;
      }

      const text = encodeURIComponent(buildWhatsappMessage());
      const url = "https://wa.me/" + WHATSAPP_PHONE + "?text=" + text;
      $messageBox.removeClass("error").addClass("success").text("WhatsApp açılıyor, randevu mesajınız hazırlandı.");
      window.open(url, "_blank");
    });

    if (localStorage.getItem("diamondCookieAccepted") !== "yes") {
      setTimeout(function () {
        $(".cookie-box").fadeIn(220);
      }, 900);
    }

    $("#cookieAccept").on("click", function () {
      localStorage.setItem("diamondCookieAccepted", "yes");
      $(".cookie-box").fadeOut(220);
    });
  });
})(jQuery);
