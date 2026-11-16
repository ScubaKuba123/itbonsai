(() => {
  const copy = {
    pl: {
      title: 'Strony, które zostają z Tobą.',
      intro: 'Łączymy światło, ruch i przestrzeń z historią marki. Od subtelnych detali po interaktywne sceny — tworzymy atmosferę, która zostaje w pamięci.',
      light: 'Światło i kolor budujące nastrój.',
      motion: 'Płynny ruch i reakcje na przewijanie.',
      depth: 'Głębia, warstwy i interaktywne kompozycje.',
      link: 'Poznaj Echo i zobacz przykłady →',
      officeInfo: 'Bezpłatna apka webowa. Bez instalacji.',
      officeLink: 'Otwórz aplikację'
    },
    en: {
      title: 'Websites that stay with you.',
      intro: 'We connect light, motion and space with your brand story. From subtle details to interactive scenes, we create an atmosphere that stays with you.',
      light: 'Light and colour that set the mood.',
      motion: 'Smooth motion and responses to scrolling.',
      depth: 'Depth, layers and interactive compositions.',
      link: 'Explore Echo and see examples →',
      officeInfo: 'A free web app. No installation needed.',
      officeLink: 'Open the app'
    },
    ja: {
      title: '心に残るウェブサイト。',
      intro: '光、動き、空間をブランドの物語と結びつけます。さりげない演出からインタラクティブなシーンまで、記憶に残る雰囲気をつくります。',
      light: '光と色で雰囲気を表現。',
      motion: '滑らかな動きとスクロールへの反応。',
      depth: '奥行き、レイヤー、触れて楽しめる構成。',
      link: 'Echoの表現と制作例を見る →',
      officeInfo: '無料のウェブアプリ。インストール不要。',
      officeLink: 'アプリを開く'
    }
  };
  function render() {
    const c = copy[document.documentElement.lang] || copy.pl;
    document.querySelectorAll('[data-home-echo]').forEach(el => {
      const value = c[el.dataset.homeEcho];
      if (value) el.textContent = value;
    });
  }
  render();
  new MutationObserver(render).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
})();
