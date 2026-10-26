// Page-local labels for contextual links; preserve existing page vocabulary.
(() => {
  const labels = {
  "en": {
    "Cennik stron internetowych": "Website pricing",
    "Projekt strony SeaMonk": "SeaMonk website project",
    "Cennik aplikacji i automatyzacji": "App and automation pricing",
    "Automatyzacje AI dla firm": "AI automation for businesses",
    "Tworzenie aplikacji dla firm": "Business app development",
    "SEO lokalne w Gdańsku": "Local SEO in Gdańsk",
    "Tworzenie stron internetowych": "Website development",
    "Pozostałe realizacje": "More projects"
  },
  "de": {
    "Cennik stron internetowych": "Preise für Websites",
    "Projekt strony SeaMonk": "Website-Projekt SeaMonk",
    "Cennik aplikacji i automatyzacji": "Preise für Apps und Automatisierung",
    "Automatyzacje AI dla firm": "KI-Automatisierung für Unternehmen",
    "Tworzenie aplikacji dla firm": "App-Entwicklung für Unternehmen",
    "SEO lokalne w Gdańsku": "Lokales SEO in Gdańsk",
    "Tworzenie stron internetowych": "Website-Entwicklung",
    "Pozostałe realizacje": "Weitere Projekte"
  },
  "es": {
    "Cennik stron internetowych": "Precios de sitios web",
    "Projekt strony SeaMonk": "Proyecto web SeaMonk",
    "Cennik aplikacji i automatyzacji": "Precios de aplicaciones y automatización",
    "Automatyzacje AI dla firm": "Automatización con IA para empresas",
    "Tworzenie aplikacji dla firm": "Desarrollo de aplicaciones para empresas",
    "SEO lokalne w Gdańsku": "SEO local en Gdańsk",
    "Tworzenie stron internetowych": "Desarrollo de sitios web",
    "Pozostałe realizacje": "Más proyectos"
  },
  "fr": {
    "Cennik stron internetowych": "Tarifs des sites web",
    "Projekt strony SeaMonk": "Projet web SeaMonk",
    "Cennik aplikacji i automatyzacji": "Tarifs des applications et automatisations",
    "Automatyzacje AI dla firm": "Automatisation IA pour les entreprises",
    "Tworzenie aplikacji dla firm": "Développement d’applications pour les entreprises",
    "SEO lokalne w Gdańsku": "SEO local à Gdańsk",
    "Tworzenie stron internetowych": "Création de sites web",
    "Pozostałe realizacje": "Autres projets"
  },
  "uk": {
    "Cennik stron internetowych": "Ціни на сайти",
    "Projekt strony SeaMonk": "Проєкт сайту SeaMonk",
    "Cennik aplikacji i automatyzacji": "Ціни на застосунки та автоматизацію",
    "Automatyzacje AI dla firm": "Автоматизація ШІ для бізнесу",
    "Tworzenie aplikacji dla firm": "Розробка застосунків для бізнесу",
    "SEO lokalne w Gdańsku": "Локальне SEO у Гданську",
    "Tworzenie stron internetowych": "Розробка сайтів",
    "Pozostałe realizacje": "Інші проєкти"
  },
  "ja": {
    "Cennik stron internetowych": "ウェブサイト制作料金",
    "Projekt strony SeaMonk": "SeaMonkのウェブサイト制作事例",
    "Cennik aplikacji i automatyzacji": "アプリ・自動化の料金",
    "Automatyzacje AI dla firm": "企業向けAI自動化",
    "Tworzenie aplikacji dla firm": "企業向けアプリ開発",
    "SEO lokalne w Gdańsku": "グダニスクのローカルSEO",
    "Tworzenie stron internetowych": "ウェブサイト制作",
    "Pozostałe realizacje": "その他の制作事例"
  },
  "zh": {
    "Cennik stron internetowych": "网站开发价格",
    "Projekt strony SeaMonk": "SeaMonk网站项目",
    "Cennik aplikacji i automatyzacji": "应用与自动化价格",
    "Automatyzacje AI dla firm": "企业AI自动化",
    "Tworzenie aplikacji dla firm": "企业应用开发",
    "SEO lokalne w Gdańsku": "格但斯克本地SEO",
    "Tworzenie stron internetowych": "网站开发",
    "Pozostałe realizacje": "更多项目"
  }
};
  window.bonsaiPortfolioCopy ||= {};
  for (const [locale, entries] of Object.entries(labels)) {
    Object.assign(window.bonsaiPortfolioCopy[locale] ||= {}, entries);
  }
})();
