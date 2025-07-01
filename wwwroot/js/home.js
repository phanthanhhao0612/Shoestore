// Slideshow
let slideIndex = 0;
function showSlides() {
  const slides = document.getElementsByClassName("slide");
  const dots = document.getElementsByClassName("dot");

  if (slides.length === 0) return;

  for (let i = 0; i < slides.length; i++) {
    slides[i].classList.remove("active");
    dots[i].classList.remove("active");
  }

  slideIndex++;
  if (slideIndex > slides.length) {
    slideIndex = 1;
  }
  slides[slideIndex - 1].classList.add("active");
  dots[slideIndex - 1].classList.add("active");

  setTimeout(showSlides, 5000);
}

function plusSlides(n) {
  slideIndex += n;
  const slides = document.getElementsByClassName("slide");
  const dots = document.getElementsByClassName("dot");

  if (slides.length === 0) return;

  for (let i = 0; i < slides.length; i++) {
    slides[i].classList.remove("active");
    dots[i].classList.remove("active");
  }

  if (slideIndex > slides.length) {
    slideIndex = 1;
  }
  if (slideIndex < 1) {
    slideIndex = slides.length;
  }
  slides[slideIndex - 1].classList.add("active");
  dots[slideIndex - 1].classList.add("active");
}

// Flash Sale Timer
function startFlashSaleTimer() {
  const countdown = document.getElementById("flash-sale-countdown");
  if (!countdown) return;

  let countDownDate = new Date().getTime() + 24 * 60 * 60 * 1000;

  const updateTimer = setInterval(() => {
    const now = new Date().getTime();
    const distance = countDownDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    countdown.textContent = `${days.toString().padStart(2, "0")}:${hours
      .toString()
      .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;

    if (distance < 0) {
      clearInterval(updateTimer);
      countdown.textContent = "Flash Sale đã kết thúc!";
    }
  }, 1000);
}

// Khởi tạo khi tải trang
showSlides();
startFlashSaleTimer();
