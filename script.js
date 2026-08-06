const menu = document.querySelector('.menu');
const nav = document.querySelector('.nav');

menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') === 'true';
  menu.setAttribute('aria-expanded', String(!open));
  menu.classList.toggle('open');
  nav.classList.toggle('mobile-open');
});

nav.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener('click', () => {
  menu.setAttribute('aria-expanded', 'false');
  nav.classList.remove('mobile-open');
}));

const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) {
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const aboutIndex = document.querySelector('#about .section-index');
const faqIndex = document.querySelector('.faq .section-index');
if (aboutIndex) aboutIndex.textContent = '04 / O nas';
if (faqIndex) faqIndex.textContent = '05 / FAQ';

const translations = {
  '04 / O nas': ['04 / About', '04 / 私たち'], '05 / FAQ': ['05 / FAQ', '05 / よくある質問'],
  'Przejdź do treści': ['Skip to content', 'コンテンツへ移動'],
  'Usługi': ['Services', 'サービス'], 'Realizacje': ['Work', '実績'], 'Proces': ['Process', '進め方'], 'Cennik': ['Pricing', '料金'], 'O nas': ['About', '私たち'],
  'Umów konsultację': ['Book a consultation', '相談を予約'],
  'Strony i automatyzacje AI, które pomagają firmom': ['Websites and AI automation that help businesses', '企業の成長を支えるウェブサイトとAI自動化'],
  'rosnąć.': ['grow.', '。'],
  'Projektujemy szybkie strony, zwiększamy widoczność w Google i automatyzujemy pracę — z jasną wyceną i konkretnym terminem.': ['We build fast websites, improve Google visibility and automate work — with transparent pricing and a clear timeline.', '高速なウェブサイトを制作し、Googleでの認知度を高め、業務を自動化します。料金と納期も明確です。'],
  'Umów bezpłatną konsultację': ['Book a free consultation', '無料相談を予約'], 'Zobacz realizacje': ['View our work', '実績を見る'],
  'Dla urządzeń mobilnych': ['Mobile-first', 'モバイルファースト'], 'SEO w standardzie': ['SEO included', 'SEO標準対応'], 'Jasna wycena': ['Transparent pricing', '明確な料金'], 'Szybki kontakt': ['Fast response', '迅速な対応'],
  '01 / Usługi': ['01 / Services', '01 / サービス'], 'Technologia, która przekłada się na': ['Technology that delivers', '成果につながる'], 'wyniki.': ['results.', 'テクノロジー。'],
  'Bez technicznego chaosu. Każde rozwiązanie ma konkretny cel: więcej zapytań, lepsza widoczność albo mniej ręcznej pracy.': ['No technical chaos. Every solution has a clear purpose: more enquiries, better visibility or less manual work.', '技術的な混乱はありません。お問い合わせの増加、認知度の向上、手作業の削減という明確な目的のために設計します。'],
  'Strony, które sprzedają': ['Websites that convert', '成果を生むウェブサイト'], 'Szybkie, responsywne serwisy prowadzące klienta od pierwszego wrażenia do kontaktu.': ['Fast, responsive websites that guide visitors from first impression to enquiry.', '第一印象からお問い合わせまで、顧客を自然に導く高速でレスポンシブなサイトです。'], 'Zwiększ liczbę zapytań ↗': ['Get more enquiries ↗', 'お問い合わせを増やす ↗'],
  'Widoczność w Google': ['Google visibility', 'Googleでの認知度'], 'Techniczne SEO, treści i struktura, dzięki którym właściwi klienci łatwiej Cię znajdują.': ['Technical SEO, content and structure that help the right customers find you.', '適切な顧客に見つけてもらうためのテクニカルSEO、コンテンツ、サイト構造を提供します。'], 'Popraw widoczność ↗': ['Improve visibility ↗', '認知度を高める ↗'],
  'Automatyzacje AI': ['AI automation', 'AI自動化'], 'Chatboty, przepływy i inteligentne narzędzia, które oszczędzają czas każdego dnia.': ['Chatbots, workflows and intelligent tools that save time every day.', 'チャットボット、ワークフロー、インテリジェントツールで日々の時間を節約します。'], 'Odzyskaj czas ↗': ['Save time ↗', '時間を取り戻す ↗'],
  'Aplikacje dla biznesu': ['Business applications', 'ビジネスアプリ'], 'Panele i systemy dopasowane do procesów firmy — proste w użyciu, gotowe do rozwoju.': ['Dashboards and systems tailored to your processes — easy to use and ready to scale.', '業務プロセスに合わせた、使いやすく拡張可能なダッシュボードとシステムです。'], 'Usprawnij pracę ↗': ['Streamline operations ↗', '業務を改善する ↗'],
  '02 / Realizacje': ['02 / Work', '02 / 実績'], 'Projekty, które mówią same za siebie.': ['Work that speaks for itself.', '成果が語るプロジェクト。'], 'Tu liczy się nie tylko wygląd. Pokazujemy problem, rozwiązanie i zweryfikowany efekt biznesowy.': ['It is about more than appearance. We show the problem, the solution and the verified business outcome.', '見た目だけではありません。課題、解決策、そして検証されたビジネス成果を紹介します。'],
  'Case study / gastronomia': ['Case study / hospitality', '事例 / 飲食'], 'Strona i lokalne SEO': ['Website and local SEO', 'ウェブサイト・ローカルSEO'], 'Więcej rezerwacji z urządzeń mobilnych': ['More bookings from mobile devices', 'モバイルからの予約を増加'], 'Miejsce na zweryfikowany wynik klienta': ['Verified client result to be added', '検証済みの顧客成果を掲載予定'],
  'Case study / turystyka': ['Case study / tourism', '事例 / 観光'], 'Serwis wielojęzyczny': ['Multilingual website', '多言語サイト'], 'Prostsza rezerwacja dla klientów z trzech rynków': ['Simpler bookings for customers across three markets', '3つの市場の顧客に、より簡単な予約体験を'],
  '03 / Cennik': ['03 / Pricing', '03 / 料金'], 'Jasny budżet. Żadnych niespodzianek.': ['A clear budget. No surprises.', '明確な予算。追加の驚きはありません。'], 'Po bezpłatnej rozmowie otrzymujesz dokładny zakres, harmonogram i wycenę.': ['After a free consultation, you receive a clear scope, timeline and quote.', '無料相談後に、明確な作業範囲、スケジュール、お見積りをご案内します。'],
  'Start': ['Start', 'スタート'], 'Strona firmowa': ['Company website', '企業サイト'], '1 500 zł': ['PLN 1,500', '1,500 PLN'], 'od 3 000 zł': ['from PLN 3,000', '3,000 PLN〜'], 'Strategia i struktura': ['Strategy and structure', '戦略・構成'], 'Projekt dla urządzeń mobilnych': ['Mobile-first design', 'モバイルファースト設計'], 'Do 5 kluczowych podstron': ['Up to 5 key pages', '主要5ページまで'], 'Podstawowe SEO': ['Core SEO setup', '基本SEO'], 'Zapytaj o termin': ['Check availability', '空き状況を確認'],
  'Najczęściej wybierany': ['Most popular', '人気プラン'], 'Strona firmowa Pro': ['Company website Pro', '企業サイト Pro'], 'Indywidualny UX/UI': ['Custom UX/UI', 'オリジナルUX/UI'], 'Rozbudowana struktura': ['Extended site structure', '充実したサイト構成'], 'Zaawansowane SEO': ['Advanced SEO', '高度なSEO'], 'Wsparcie po wdrożeniu': ['Post-launch support', '公開後サポート'],
  'Rozwój': ['Growth', '成長'], 'Premium + AI': ['Premium + AI', 'Premium + AI'], 'od 6 000 zł': ['from PLN 6,000', '6,000 PLN〜'], 'Dedykowany projekt': ['Bespoke design', '完全オリジナル設計'], 'Integracje i automatyzacje': ['Integrations and automation', '連携・自動化'], 'Zaawansowane animacje': ['Advanced motion', '高度なアニメーション'], 'Priorytetowe wsparcie': ['Priority support', '優先サポート'], 'Porozmawiajmy': ["Let's talk", '相談する'],
  '04 / Proces': ['04 / Process', '04 / 進め方'], 'Od pierwszej rozmowy do efektu.': ['From first conversation to results.', '最初の対話から成果まで。'], 'Rozmowa': ['Discovery', 'ヒアリング'], 'Cele i potrzeby biznesowe.': ['Business goals and needs.', 'ビジネス目標とニーズ。'], 'Plan i wycena': ['Plan and quote', '計画・見積り'], 'Zakres, termin i koszt.': ['Scope, timeline and cost.', '範囲、納期、費用。'], 'Projekt': ['Design', '設計'], 'UX, UI i komunikacja.': ['UX, UI and messaging.', 'UX、UI、コミュニケーション。'], 'Wdrożenie': ['Development', '実装'], 'Kod, SEO i testy.': ['Code, SEO and testing.', '実装、SEO、テスト。'], 'Pomiar i optymalizacja.': ['Measurement and optimisation.', '計測・最適化。'],
  'Założyciel BonsAi Studio': ['Founder of BonsAi Studio', 'BonsAi Studio 代表'], '05 / O nas': ['05 / About', '05 / 私たち'], 'Technologia z ludzkim podejściem.': ['Technology with a human approach.', '人を中心にしたテクノロジー。'], 'Front-end development': ['Front-end development', 'フロントエンド開発'],
  'Jakub „Scuba Kuba” Mierosławski łączy doświadczenie front-end developera z prowadzeniem SeaMonk.jp — szkoły nurkowej na Hokkaido. Dzięki temu rozumie nie tylko technologię, ale też codzienne wyzwania małej firmy, obsługę klientów i potrzebę rozwiązań, które naprawdę ułatwiają pracę.': ['Jakub “Scuba Kuba” Mierosławski combines front-end development experience with running SeaMonk.jp, a diving school in Hokkaido. This gives him a practical understanding of technology, small-business challenges, customer service and solutions that genuinely make work easier.', 'Jakub “Scuba Kuba” Mierosławskiは、フロントエンド開発の経験と、北海道のダイビングスクールSeaMonk.jpの運営経験を併せ持っています。技術だけでなく、小規模事業の課題、顧客対応、実務を本当に楽にする仕組みを理解しています。'],
  'W BonsAi Studio rozmawiasz bezpośrednio z osobą, która projektuje i wdraża Twój serwis — bez przekazywania projektu między działami.': ['At BonsAi Studio, you work directly with the person who designs and builds your website — without hand-offs between departments.', 'BonsAi Studioでは、サイトを設計・実装する本人と直接やり取りできます。部門間の引き継ぎはありません。'], 'Praktyka biznesowa': ['Business experience', '事業運営経験'], 'Bezpośredni kontakt': ['Direct contact', '直接対応'], 'Zobacz profil zawodowy ↗': ['View professional profile ↗', 'プロフィールを見る ↗'],
  '06 / FAQ': ['06 / FAQ', '06 / よくある質問'], 'Najczęstsze pytania.': ['Frequently asked questions.', 'よくある質問。'], 'Ile trwa realizacja strony?': ['How long does a website take?', '制作期間はどのくらいですか？'], 'Podstawowa strona firmowa może być gotowa w 1–2 tygodnie, a rozbudowany serwis zwykle w 2–4 tygodnie.': ['A standard company website can be ready in 1–2 weeks; a larger website usually takes 2–4 weeks.', '基本的な企業サイトは1〜2週間、より大規模なサイトは通常2〜4週間です。'], 'Czy SEO jest w cenie?': ['Is SEO included?', 'SEOは料金に含まれますか？'], 'Tak. Każdy projekt otrzymuje techniczny fundament SEO. Szersza strategia treści i pozycjonowania jest wyceniana osobno.': ['Yes. Every project includes a technical SEO foundation. Broader content and search strategies are quoted separately.', 'はい。すべてのプロジェクトに基本的なテクニカルSEOを含みます。コンテンツ戦略や継続的なSEOは別途お見積りします。'], 'Czy mogę rozwijać stronę później?': ['Can the website grow later?', '後からサイトを拡張できますか？'], 'Tak. Projektujemy modułowo, aby w przyszłości dodać rezerwacje, sklep, blog lub automatyzacje.': ['Yes. We build modularly so bookings, ecommerce, a blog or automation can be added later.', 'はい。予約、EC、ブログ、自動化などを後から追加できるモジュール設計です。'], 'Jak zaczynamy?': ['How do we start?', 'どのように始めますか？'], 'Od krótkiej, bezpłatnej rozmowy. W ciągu dwóch dni roboczych otrzymasz propozycję zakresu i harmonogramu.': ['With a short, free consultation. Within two business days, you receive a proposed scope and timeline.', '短い無料相談から始めます。2営業日以内に作業範囲とスケジュールをご提案します。'],
  'Zacznijmy': ["Let's begin", 'はじめましょう'], 'Porozmawiajmy o wzroście Twojej firmy.': ["Let's talk about growing your business.", 'ビジネスの成長について話しましょう。'], 'Opisz krótko, czego potrzebujesz. Odpowiemy z konkretnym następnym krokiem.': ['Tell us briefly what you need. We will reply with a clear next step.', '必要なことを簡単にお聞かせください。具体的な次のステップをご案内します。'], 'Imię i nazwisko': ['Name', 'お名前'], 'E-mail firmowy': ['Business email', '会社メール'], 'W czym możemy pomóc?': ['How can we help?', 'ご相談内容'], 'Nowa strona internetowa': ['New website', '新しいウェブサイト'], 'SEO i widoczność': ['SEO and visibility', 'SEO・認知度向上'], 'Automatyzacja AI': ['AI automation', 'AI自動化'], 'Aplikacja webowa': ['Web application', 'ウェブアプリ'], 'Krótko o projekcie': ['Project summary', 'プロジェクト概要'], 'Wyślij wiadomość': ['Send message', 'メッセージを送信'], 'Wysyłając formularz, akceptujesz politykę prywatności.': ['By submitting, you accept the privacy policy.', '送信によりプライバシーポリシーに同意したものとみなされます。'],
  'Strony, SEO i automatyzacje dla firm, które chcą rosnąć.': ['Websites, SEO and automation for businesses ready to grow.', '成長を目指す企業のためのウェブサイト、SEO、自動化。'], 'Kontakt': ['Contact', 'お問い合わせ'], 'Gdańsk · Polska': ['Gdańsk · Poland', 'グダニスク・ポーランド'],
  'Odpowiedź zwykle w 24h': ['Usually replies within 24h', '通常24時間以内に返信'], 'Bezpłatna pierwsza rozmowa': ['Free first consultation', '初回相談無料'], 'Jasna wycena przed startem': ['Clear quote before we start', '開始前に明確なお見積り'],
  'Start': ['Home', 'ホーム'], 'Cyfrowa architektura dla': ['Digital architecture for', 'デジタル建築を'], 'ambitnych firm.': ['ambitious companies.', '挑戦する企業へ。'],
  'Dla kogo': ['Who we help', '対象業種'], 'Rozwiązania dla firm, które chcą pozyskiwać klientów': ['Solutions for businesses that want to win customers', '顧客獲得を強化したい企業のためのソリューション'], 'skuteczniej.': ['more effectively.', 'より効果的に。'],
  'Usługi lokalne': ['Local services', '地域サービス'], 'Turystyka': ['Tourism', '観光'], 'Gastronomia': ['Hospitality', '飲食'], 'Eksperci i konsultanci': ['Experts and consultants', '専門家・コンサルタント'], 'Małe sklepy': ['Small retailers', '小規模店舗'], 'Firmy B2B': ['B2B companies', 'B2B企業'],
  'Koncepcja / gastronomia': ['Concept / hospitality', 'コンセプト / 飲食'], 'Projekt własny / turystyka': ['Own project / tourism', '自社プロジェクト / 観光'], 'Zapytaj o podobny projekt ↗': ['Ask about a similar project ↗', '類似プロジェクトについて相談 ↗'], 'Zobacz stronę SeaMonk ↗': ['Visit SeaMonk website ↗', 'SeaMonkサイトを見る ↗'], 'Zobacz stronę SeaMonk.jp ↗': ['Visit SeaMonk.jp ↗', 'SeaMonk.jpを見る ↗'],
  'Projekt aplikacji / biznes': ['Application project / business', 'アプリ開発 / ビジネス'], 'Dedykowana aplikacja dla firmy': ['Custom business application', '企業向けカスタムアプリ'], 'Narzędzie dopasowane do codziennej pracy zespołu': ["A tool tailored to the team's daily work", 'チームの日常業務に合わせたツール'], 'Zakres: analiza potrzeb · UX/UI · aplikacja webowa · wdrożenie': ['Scope: needs analysis · UX/UI · web application · delivery', '範囲：要件分析・UX/UI・Webアプリ・導入'], 'Zapytaj o aplikację dla firmy ↗': ['Ask about a business application ↗', '企業向けアプリについて相談 ↗'],
  'Automatyzacja / eventy': ['Automation / events', '自動化 / イベント'], 'Automatyzacja firmy eventowej': ['Event company automation', 'イベント会社の自動化'], 'Jeden organizm zamiast odłączonych narzędzi': ['One organism instead of disconnected tools', '分断されたツールを一つの仕組みに'], 'E-mail, social media i rezerwacje współpracują jak zdrowe korzenie jednego organizmu — informacje przepływają automatycznie, a zespół ma mniej ręcznej pracy.': ['Email, social media and bookings work together like healthy roots of one organism — information flows automatically and the team does less manual work.', 'メール、SNS、予約が一つの生きた根のように連携し、情報が自動で流れ、手作業を減らします。'], 'Zautomatyzuj swoją firmę ↗': ['Automate your business ↗', 'ビジネスを自動化 ↗'],
  'Wielojęzyczny serwis centrum nurkowego': ['Multilingual diving-centre website', '多言語対応ダイビングセンターサイト'], 'Od inspiracji do rezerwacji nurkowania w Okinawie': ['From inspiration to booking a dive in Okinawa', '沖縄でのダイビング予約までをスムーズに'], 'Oferta w języku angielskim i japońskim, prezentacja miejsc nurkowych, informacje dla uczestników, formularze i szybki kontakt w jednym serwisie.': ['English and Japanese offers, dive-site presentation, participant information, forms and fast contact in one website.', '英語・日本語のサービス案内、ダイビングスポット、参加者向け情報、フォーム、問い合わせを一つのサイトに集約。'],
  'Ceny są orientacyjne. Dokładną wycenę, zakres i harmonogram otrzymasz po bezpłatnej rozmowie — przed rozpoczęciem prac.': ['Prices are indicative. You receive an exact quote, scope and timeline after a free consultation — before work begins.', '価格は目安です。無料相談後、作業開始前に正確なお見積り・範囲・スケジュールをご提示します。'],
  'Jak wygląda płatność?': ['How does payment work?', '支払い方法は？'], 'Ile poprawek obejmuje projekt?': ['How many revision rounds are included?', '修正回数は？'], 'Inne': ['Other', 'その他'], 'Odpowiadamy zwykle w ciągu 24 godzin.': ['We usually reply within 24 hours.', '通常24時間以内に返信します。'],
  'Od początku do skali.': ['From origin to scale.', '始まりから成長へ。'], 'Pomiń intro': ['Skip intro', 'スキップ'],
  'Strony internetowe, SEO i': ['Websites, SEO and', 'ウェブサイト、SEO、'], 'automatyzacje AI dla firm.': ['AI automation for businesses.', '企業向けAI自動化。'],
  'Budujemy szybszą, profesjonalną obecność online, która pomaga zdobywać zapytania, poprawia widoczność w Google i ogranicza ręczną pracę.': ['We build a faster, professional online presence that wins enquiries, improves Google visibility and reduces manual work.', '問い合わせ獲得、Googleでの可視性向上、手作業削減につながる高速でプロフェッショナルなオンライン基盤を構築します。'],
  'Bezpłatna analiza strony': ['Free website analysis', '無料サイト分析'], 'Otrzymaj wycenę': ['Get a quote', '見積もりを依頼'], 'Nie publikujemy strony bez Twojej akceptacji.': ['We never publish without your approval.', '承認なしに公開することはありません。'],
  'Bezpłatna analiza': ['Free analysis', '無料分析'], 'Otrzymaj konkretny następny krok.': ['Get a clear next step.', '明確な次のステップをご提案します。'], 'Napisz na WhatsApp ↗': ['Message us on WhatsApp ↗', 'WhatsAppで相談 ↗'], 'Otrzymaj bezpłatną analizę': ['Get a free analysis', '無料分析を依頼']
};

const originalText = new WeakMap();
const textNodes = [];
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
  acceptNode(node) {
    return node.parentElement?.closest('script,style,canvas') || !node.textContent.trim() ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
  }
});
while (walker.nextNode()) {
  const node = walker.currentNode;
  originalText.set(node, node.textContent);
  textNodes.push(node);
}

const pageMeta = {
  pl: ['Strony internetowe i automatyzacje AI | BonsAi Studio', 'BonsAi Studio projektuje szybkie strony internetowe, poprawia widoczność w Google i automatyzuje pracę małych firm. Jasna wycena i konkretny termin.'],
  en: ['Websites and AI Automation | BonsAi Studio', 'BonsAi Studio builds fast websites, improves Google visibility and automates work for small businesses. Transparent pricing and clear timelines.'],
  ja: ['ウェブサイト制作・AI自動化 | BonsAi Studio', 'BonsAi Studioは高速なウェブサイト制作、Googleでの認知度向上、中小企業向けの業務自動化を提供します。明確な料金と納期。']
};

function translateAttributes(lang) {
  const values = {
    pl: ['Główna nawigacja', 'Otwórz menu', 'Wybór języka', 'Media społecznościowe', 'Jakub Mierosławski, założyciel BonsAi Studio'],
    en: ['Main navigation', 'Open menu', 'Choose language', 'Social media', 'Jakub Mierosławski, founder of BonsAi Studio'],
    ja: ['メインナビゲーション', 'メニューを開く', '言語を選択', 'ソーシャルメディア', 'BonsAi Studio代表 Jakub Mierosławski']
  }[lang];
  nav.setAttribute('aria-label', values[0]);
  menu.setAttribute('aria-label', values[1]);
  document.querySelector('.language-switcher')?.setAttribute('aria-label', values[2]);
  document.querySelector('.social-links')?.setAttribute('aria-label', values[3]);
  const aboutImage = document.querySelector('#about img');
  if (aboutImage) aboutImage.alt = values[4];
}

function setLanguage(lang) {
  const language = ['pl', 'en', 'ja'].includes(lang) ? lang : 'pl';
  textNodes.forEach((node) => {
    const source = originalText.get(node);
    const key = source.trim();
    const translated = translations[key]?.[language === 'en' ? 0 : 1];
    const replacement = language === 'pl' || !translated ? key : translated;
    const isJapaneseHeroLead = language === 'ja' && node.parentElement === document.querySelector('h1') && key === 'Strony i automatyzacje AI, które pomagają firmom';
    node.textContent = isJapaneseHeroLead ? replacement : source.replace(key, replacement);
  });
  document.documentElement.lang = language;
  document.title = pageMeta[language][0];
  document.querySelector('meta[name="description"]').content = pageMeta[language][1];
  translateAttributes(language);
  document.querySelectorAll('[data-lang]').forEach((button) => {
    const active = button.dataset.lang === language;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  localStorage.setItem('bonsai-language', language);
}

document.querySelectorAll('[data-lang]').forEach((button) => button.addEventListener('click', () => {
  setLanguage(button.dataset.lang);
  if (innerWidth <= 900) {
    menu.setAttribute('aria-expanded', 'false');
    menu.classList.remove('open');
    nav.classList.remove('mobile-open');
  }
}));
setLanguage(localStorage.getItem('bonsai-language') || 'pl');

document.querySelectorAll('[data-bonsai-particles]').forEach((container) => {
  if (container.childElementCount) return;
  for (let index = 0; index < 12; index += 1) {
    const particle = document.createElement('span');
    particle.className = 'production-particle';
    particle.style.left = `${54 + Math.random() * 35}%`;
    particle.style.top = `${48 + Math.random() * 32}%`;
    particle.style.setProperty('--particle-duration', `${5.4 + Math.random() * 3}s`);
    particle.style.setProperty('--particle-delay', `${-Math.random() * 7}s`);
    particle.style.setProperty('--particle-drift', `${-18 + Math.random() * 36}px`);
    container.appendChild(particle);
  }
});

const animatedHero = document.querySelector('[data-bonsai-hero]');
if (animatedHero && 'IntersectionObserver' in window) {
  const heroObserver = new IntersectionObserver(([entry]) => {
    animatedHero.classList.toggle('is-offscreen', !entry.isIntersecting);
  }, { threshold: 0.08 });
  heroObserver.observe(animatedHero);
}
