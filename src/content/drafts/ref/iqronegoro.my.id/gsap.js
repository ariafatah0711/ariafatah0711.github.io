window.addEventListener("load", async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const tl = gsap.timeline();

  gsap.registerPlugin(ScrollTrigger);

  ScrollTrigger.defaults({
    scroller: "#container",
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          gsap.to(`#${entry.target.id} .pop-up`, {
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            opacity: 1,
            ease: "power1.inOut",
          });
        }
      });
    },
    {
      threshold: 0.75,
      rootMargin: "-10% 0px",
      root: null,
    }
  );

  tl.to(".header-text", {
    y: "-100%",
    duration: 0.75,
    opacity: 1,
    stagger: {
      each: 0.75,
      onComplete: function (index, target, targets) {
        gsap.to(this.targets()[0], {
          y: "-200%",
          duration: 0.75,
          opacity: 0,
          ease: "power1.inOut",
          onComplete: function () {
            this.targets()[0].remove();
          },
        });
      },
    },
    onComplete: () => {
      gsap.to("#name", {
        y: "-100%",
        duration: 0.75,
        opacity: 1,
        ease: "power1.inOut",
        onComplete: () => {
          gsap.to("#nameContainer", {
            y: -20,
            scrollTrigger: {
              scrub: 1,
              trigger: "#index",
              start: "top top",
            },
          });

          gsap.to("#description", {
            y: "0",
            duration: 0.75,
            opacity: 1,
            ease: "power1.inOut",
            onComplete: () => {
              gsap.to(".description", {
                opacity: 0.5,
                stagger: 0.5,
                scrollTrigger: {
                  scrub: 1,
                  trigger: "#name",
                  start: "top 20%",
                },
              });

              gsap.to(".about-description", {
                opacity: 0.5,
                stagger: 0.5,
                scrollTrigger: {
                  scrub: 1,
                  trigger: "#about",
                  start: "top top",
                },
              });

              gsap.to("header .pop-up", {
                y: 0,
                duration: 0.5,
                stagger: 0.1,
                opacity: 1,
                ease: "power1.inOut",
                onComplete: () => {
                  document.querySelectorAll("section").forEach((section) => {
                    observer.observe(section);
                  });
                },
              });
            },
          });
        },
      });
    },
    ease: "power1.inOut",
  });

  ScrollTrigger.refresh();
});
