window.addEventListener("load", () => {
    document.getElementById("year").textContent = new Date().getFullYear();

    gsap.to("#loader div", {
        y: -1000,
        opacity: 0,
        duration: 1,
        onComplete: () => {
            gsap.to("#loader", {
                opacity: 0,
                duration: 1,
                onComplete: () => {
                    document.getElementById("loader").remove();
                    const page = document.getElementById("page");

    let lastPage = 0;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.75) {
                gsap.to(page, {
                    y: lastPage > entry.target.dataset.i ? -10 : 10,
                    duration: 0.1,
                    opacity: 0,
                    ease: "power1.inOut",
                    onComplete: () => {
                        page.textContent = entry.target.dataset.i;
                        gsap.to(page, {
                            y: 0,
                            duration: 0.1,
                            opacity: 1,
                            ease: "power1.inOut",
                        })
                        lastPage = entry.target.dataset.i;
                    }
                });

                gsap.to(`nav a[href='#${entry.target.id}'] i`, {
                    y: 0,
                    opacity: 1,
                    duration: 0.1,
                    ease: "power1.inOut",
                });
            } else {
                gsap.to(`nav a[href='#${entry.target.id}'] i`, {
                    y: 8,
                    opacity: 0,
                    duration: 0.1,
                    ease: "power1.inOut",
                });
            }
        });
    }, {
        threshold: 0.75,
        rootMargin: '-10% 0px',
        root: null
    });

    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
                }
            })
        }
    })
});