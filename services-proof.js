(() => {
  const promises = document.querySelector(".svc-promises");
  if (promises) {
    const copy = [
      ["Projekt i wdrożenie razem", "Nie kończymy na makiecie. Projektujemy, budujemy, testujemy i przygotowujemy stronę do publikacji."],
      ["Najpierw pokazujemy", "Pracujemy na działających przykładach, żeby decyzja nie opierała się na technicznych obietnicach."],
      ["Efekt ma konkretny cel", "Ruch i interakcje wzmacniają markę albo ułatwiają wybór — nigdy nie są tylko ozdobą ekranu."]
    ];
    promises.querySelectorAll("article").forEach((card, index) => {
      const title = card.querySelector("h2 span");
      const body = card.querySelector("p span");
      if (copy[index] && title && body) {
        title.textContent = copy[index][0];
        body.textContent = copy[index][1];
      }
    });
  }

  const oldEcho = document.querySelector(".svc-echo");
  if (!oldEcho) return;
  const hasLiveLandscape = Boolean(oldEcho.querySelector('[data-echo-river]'));
  const proofMarkup = `
    <section class="svc-proof" id="${hasLiveLandscape ? 'echo-projects' : 'echo'}" aria-labelledby="svc-proof-title">
      <header class="svc-proof__head">
        <p class="svc-label">DLACZEGO BONSAI STUDIO?</p>
        <h2 id="svc-proof-title">Nie opowiadamy o efektach.<br>Pokazujemy, jak pracują.</h2>
        <p>Każdy projekt zaczyna się od problemu odbiorcy. Dopiero potem wybieramy układ, technologię i ruch.</p>
      </header>
      <div class="svc-proof__examples">
        <article>
          <div class="svc-proof__media"><img src="assets/portfolio/bangingo-home-20261026.jpg" alt="Bangingo — strona rejsów z motywem wody" width="1200" height="800" loading="lazy"><span>WATER WEBSITE</span></div>
          <div class="svc-proof__copy"><small>01 / BANGINGO</small><h3>Woda nie jest tłem.<br><em>Buduje charakter marki.</em></h3><dl><div><dt>Problem</dt><dd>Zwykła fotografia łodzi nie przekazywała emocji rejsu.</dd></div><div><dt>Rozwiązanie</dt><dd>Ruch tafli, światło i odbicia tworzą atmosferę, nie zasłaniając oferty.</dd></div><div><dt>Po co?</dt><dd>Klient zapamiętuje doświadczenie, a nie kolejny szablon turystyczny.</dd></div></dl></div>
        </article>
        <article>
          <div class="svc-proof__media"><video autoplay muted loop playsinline poster="assets/portfolio/lukka-motion-poster-20261025.webp" aria-label="Lukka — animowana nawigacja z pizzą"><source src="assets/portfolio/lukka-motion-current-v2.webm" type="video/webm"></video><span>MOTION WEBSITE</span></div>
          <div class="svc-proof__copy"><small>02 / LUKKA</small><h3>Ruch nie rozprasza.<br><em>Prowadzi do wyboru.</em></h3><dl><div><dt>Problem</dt><dd>Długa lista kategorii menu była poprawna, ale nie budowała ciekawości.</dd></div><div><dt>Rozwiązanie</dt><dd>Kawałki pizzy reagują i prowadzą do konkretnych części oferty.</dd></div><div><dt>Po co?</dt><dd>Interakcja jednocześnie wyjaśnia nawigację i zostaje w pamięci.</dd></div></dl></div>
        </article>
        <article>
          <div class="svc-proof__media"><img src="assets/portfolio/aris-zorza.png" alt="ARIS — przestrzenna prezentacja ramy" width="1200" height="800" loading="lazy"><span>3D EFFECT</span></div>
          <div class="svc-proof__copy"><small>03 / ARIS</small><h3>Produkt nie jest płaski.<br><em>Można zobaczyć jego budowę.</em></h3><dl><div><dt>Problem</dt><dd>Jedno zdjęcie nie pokazywało warstw i jakości oprawy.</dd></div><div><dt>Rozwiązanie</dt><dd>Rama, szkło, passe-partout i zdjęcie rozchodzą się w przestrzeni.</dd></div><div><dt>Po co?</dt><dd>Klient rozumie produkt przed kontaktem i łatwiej podejmuje decyzję.</dd></div></dl></div>
        </article>
      </div>
      <div class="svc-proof__echo">
        <div><p class="svc-label">ECHO EFFECT · WEBSITES THAT STAY WITH YOU</p><h2>Jedna cecha marki zamieniona w doświadczenie.</h2><p>Echo Effect nie jest gotową animacją. Wybieramy element, z którym marka powinna zostać zapamiętana, i budujemy wokół niego zachowanie strony.</p></div>
        <ol><li><span>01</span><b>Wybieramy skojarzenie</b><p>Woda, światło, ruch, materiał albo budowa produktu.</p></li><li><span>02</span><b>Zamieniamy je w interakcję</b><p>Reakcję na przewijanie, zmianę głębi lub prezentację 3D.</p></li><li><span>03</span><b>Chronimy użyteczność</b><p>Efekt nie może spowalniać telefonu, zasłaniać treści ani utrudniać kontaktu.</p></li></ol>
        <p class="svc-proof__definition"><strong>W skrócie:</strong> użytkownik nie tylko czyta o marce — przez kilka sekund jej doświadcza.</p>
      </div>
    </section>
  `;
  if (hasLiveLandscape) oldEcho.insertAdjacentHTML('afterend', proofMarkup);
  else oldEcho.outerHTML = proofMarkup;
})();
