// Efeito de "ripple" (onda) ao clicar nos botões e ícones sociais
document.addEventListener('DOMContentLoaded', () => {
  const elementos = document.querySelectorAll('.link, .redes a');

  elementos.forEach((el) => {
    el.addEventListener('click', (evento) => {
      const rect = el.getBoundingClientRect();
      const tamanho = Math.max(rect.width, rect.height);

      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.width = `${tamanho}px`;
      ripple.style.height = `${tamanho}px`;
      ripple.style.left = `${evento.clientX - rect.left - tamanho / 2}px`;
      ripple.style.top = `${evento.clientY - rect.top - tamanho / 2}px`;

      el.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
});
