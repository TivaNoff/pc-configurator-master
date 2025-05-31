// public/js/localization.js
const translations = {
  en: {
    // General UI
    pageTitle: "PC Configurator",
    loading_build_data: "Loading build data...",
    loading_components: "Loading components...",
    processing_request: "Processing request...",
    error_prefix: "Error",
    api_error_prefix: "API Error",
    check_console_details: "Check console for details.",
    unknown_component: "Unknown Component",
    unnamed_component: "Unnamed Component",
    unnamed_build_placeholder: "Unnamed Build",
    new_build_default_name: "New Build", // Used if no specific time-based name
    new_build_default_name_prefix: "New Build", // Prefix for time-based new build name
    you_author_placeholder: "You",
    anonymous_author: "Anonymous",
    login_to_start: "Login to get started",
    buy_button_text: "Buy",
    remove_button_title: "Remove",
    add_btn_prefix: "+ Add ",
    swap_btn_text: "Swap",
    category_na: "N/A",
    specifications_title: "Specifications",
    no_additional_specs: "No additional specifications available.",
    thumbnail_alt_prefix: "Thumbnail for",
    availability_in_stock: "In Stock",
    availability_out_of_stock: "Out of Stock", // Example for other statuses
    no_price_data_available: "No pricing data available.",
    part_details_title_modal: "Part Details: {partName}",

    // Sidebar
    nav_builder: "3D Builder",
    nav_products: "Products",
    nav_compare: "Compare",
    nav_gallery: "3D Part Gallery",
    nav_community: "Community",
    nav_completed_builds: "Completed Builds",
    nav_updates: "Updates",
    current_build_title: "Current Build",
    signup_btn: "Sign Up",
    login_link: "Log In",
    theme_toggle_dark: "Dark",
    theme_toggle_light: "Light",

    // Build Page - Header & Main Info
    new_build_btn: "+ New Build",
    parts_list_title: "Parts List",
    compatibility_status_compatible: "Compatible",
    compatibility_status_incompatible: "Incompatible",
    compatibility_status_unknown: "—",

    // Build Page - Gemini Features
    compatibility_advice_btn: "✨ Get Compatibility Advice",
    generate_description_btn: "✨ Generate Build Description",
    estimate_performance_btn: "✨ Estimate Performance",
    gemini_modal_title_default: "AI Response", // Fallback title
    gemini_modal_title_description: "Build Description",
    gemini_modal_title_compatibility: "Compatibility Advice",
    gemini_modal_title_performance: "Performance Estimate",
    gemini_error_unexpected_response:
      "Could not get a response from AI. Please try again.",

    // Build Page - Alerts & Prompts for Gemini
    alert_add_components_for_description:
      "Please add components to the build to generate a description.",
    alert_add_min_two_components_for_compatibility:
      "Add at least two components for compatibility analysis.",
    alert_not_enough_crucial_components_for_compatibility:
      "Not enough crucial components for detailed compatibility analysis.",
    alert_add_components_for_performance:
      "Please add components to estimate performance.",
    compatibility_components_list_header: "Key components for analysis:",
    compatibility_advice_question:
      "What are the main points the user should check (e.g., CPU socket and motherboard, RAM type and motherboard support, PSU wattage, physical dimensions)?",
    performance_components_list_header: "Components for estimation:",
    prompt_generate_description_en_template:
      "Create a short (2-4 sentences), appealing, and informative marketing description for a PC build. The description should be in English. Mention what tasks this build might be suitable for (e.g., gaming, work, study, creative tasks). Components:\n{partDetails}",
    prompt_compatibility_advice_en_template:
      "My PC configurator program indicates that the following configuration is incompatible. Please provide, in English, possible general reasons for incompatibility between these components and advice on how to check them. Do not make definitive conclusions, only assumptions based on the provided information.",
    prompt_estimate_performance_en_template:
      "Please provide, in English, a general assessment of the performance and purpose of the following PC build. Indicate what tasks (e.g., modern games at 1080p/1440p/4K resolution, streaming, video editing, 3D modeling, office work, study) it is suitable for. Highlight the strengths of the build and potential bottlenecks or component imbalances, if any. Do not provide exact FPS numbers or benchmark results; the assessment should be qualitative.",

    // Quick Add Modal
    filters_title: "Filters",
    filter_compatibility_only: "Compatibility Only",
    filter_3d_only: "3D Only",
    filter_price: "Price",
    sort_by: "Sort by",
    sort_default: "Default",
    sort_price_asc: "Price: low to high",
    sort_price_desc: "Price: high to low",
    search_by_name_placeholder: "Search by name...",
    rows_per_page: "Rows per page",
    products_found: "{count} Product(s) Found",
    add_to_build_btn_text: "Add to build",
    pagination_page_info: "Page {currentPage} of {totalPages}",
    pagination_first_page: "First Page",
    pagination_prev_page: "Previous Page",
    pagination_next_page: "Next Page",
    pagination_last_page: "Last Page",
    yes_filter: "Yes",
    no_filter: "No",
    error_loading_components_quickadd: "Error loading or processing products:",
    error_failed_to_load_components:
      "Failed to load components. Please try again.",
    error_product_not_found_by_id: "Product not found for card ID:",

    // Part Categories (used for display and button text)
    PCCase: "PC Case",
    Motherboard: "Motherboard",
    CPU: "CPU",
    CPUCooler: "CPU Cooler",
    GPU: "GPU",
    RAM: "RAM",
    Storage: "Storage",
    PSU: "Power Supply",
    NetworkCard: "Network Card",
    CaseFan: "Case Fan",
    Monitor: "Monitor",
    SoundCard: "Sound Card",

    // Spec Keys (for product cards and Gemini prompts)
    spec_key_form_factor: "Form Factor",
    spec_key_socket: "Socket",
    spec_key_chipset: "Chipset",
    spec_key_memory_type: "Memory Type",
    spec_key_ram_type: "RAM Type",
    spec_key_capacity: "Capacity",
    spec_key_cores: "Cores",
    spec_key_threads: "Threads",
    spec_key_base_clock: "Base Clock",
    spec_key_boost_clock: "Boost Clock",
    spec_key_memory_size: "Memory Size",
    spec_key_interface: "Interface",
    spec_key_length_mm: "Length (mm)",
    spec_key_max_gpu_length_mm: "Max GPU Length (mm)",
    spec_key_max_cpu_cooler_height_mm: "Max CPU Cooler Height (mm)",
    spec_key_wattage: "Wattage",
    spec_key_efficiency_rating: "Efficiency Rating",
    spec_key_modular: "Modular",
    spec_key_type: "Type",
    spec_key_speed_mhz: "Speed (MHz)",
    spec_key_side_panel: "Side Panel",
    spec_key_power_supply: "Power Supply",
    spec_key_rpm_min: "RPM (min)",
    spec_key_rpm_max: "RPM (max)",
    spec_key_noise_level_min: "Noise (min dBA)",
    spec_key_noise_level_max: "Noise (max dBA)",
    spec_key_water_cooled: "Water Cooled",
    spec_key_screen_size: "Screen Size",
    spec_key_resolution: "Resolution",
    spec_key_refresh_rate: "Refresh Rate",
    spec_key_panel_type: "Panel Type",
    spec_key_modules: "Modules",
    spec_key_nvme: "NVMe",
    spec_key_ecc: "ECC",
    spec_key_registered: "Registered",
    spec_key_heat_spreader: "Heat Spreader",
    spec_key_rgb: "RGB",
    spec_key_microarchitecture: "Microarchitecture",
    spec_key_integrated_graphics: "Integrated Graphics",
    spec_key_specifications_integratedgraphics_model:
      "Integrated Graphics Model", // Example for nested
    spec_key_memory_ram_type: "RAM Type (Memory)", // Example for nested
    spec_key_metadata_manufacturer: "Manufacturer",
    spec_key_resolution_verticalres: "Vertical Resolution",
    spec_key_resolution_horizontalres: "Horizontal Resolution",

    // Labels for Gemini prompts (can be more descriptive)
    socket_label: "Socket",
    chipset_label: "Chipset",
    ram_type_label: "RAM Type",
    type_label: "Type",
    length_label: "Length",
    wattage_label: "Wattage",
    max_gpu_length_label: "Max GPU Length",
    cores_label: "cores",
    threads_label: "threads",
    category_label: "Category",
    spec_table_header_spec: "Specification",
    spec_table_header_value: "Value",
    add_to_build_btn_modal: "Add to Build",
    affiliate_disclaimer:
      "* BuildCores may receive compensation for affiliate sales through these links",

    // Saved Builds Page
    please_login_to_see_builds: "Please login to see saved builds.",
    error_loading_build_list_status: "Failed to load build list",
    no_builds_found: "No builds found.",
    error_loading_build_list: "Error loading build list.",
    error_loading_build_status: "Failed to load build",
    error_loading_component_status: "Failed to load component",
    alert_login_to_create_build: "Please login to create a new build.",
    error_creating_build_status: "Failed to create new build",
    alert_error_creating_build: "Failed to create new build. Please try again.",
    confirm_delete_build_message:
      "Are you sure you want to delete the build '{buildName}'?",
    error_deleting_build: "Failed to delete build.",
    error_alert_deleting_build: "An error occurred while deleting.",
    load_button_text: "Load",
    delete_button_text: "Delete",
    created_at_text: "Created",
  },
  uk: {
    // General UI
    pageTitle: "Конфігуратор ПК",
    loading_build_data: "Завантаження даних збірки...",
    loading_components: "Завантаження компонентів...",
    processing_request: "Обробка запиту...",
    error_prefix: "Помилка",
    api_error_prefix: "Помилка API",
    check_console_details: "Перевірте консоль для деталей.",
    unknown_component: "Невідомий компонент",
    unnamed_component: "Компонент без назви",
    unnamed_build_placeholder: "Збірка без назви",
    new_build_default_name: "Нова збірка",
    new_build_default_name_prefix: "Нова збірка",
    you_author_placeholder: "Ви",
    anonymous_author: "Анонім",
    login_to_start: "Увійдіть, щоб почати",
    buy_button_text: "Купити",
    remove_button_title: "Видалити",
    add_btn_prefix: "+ Додати ",
    swap_btn_text: "Замінити",
    category_na: "Н/Д",
    specifications_title: "Характеристики",
    no_additional_specs: "Додаткові характеристики відсутні.",
    thumbnail_alt_prefix: "Мініатюра для",
    availability_in_stock: "В наявності",
    availability_out_of_stock: "Немає в наявності",
    no_price_data_available: "Дані про ціну відсутні.",
    part_details_title_modal: "Деталі компонента: {partName}",

    // Sidebar
    nav_builder: "3D Конструктор",
    nav_products: "Компоненти",
    nav_compare: "Порівняння",
    nav_gallery: "Галерея 3D Компонентів",
    nav_community: "Спільнота",
    nav_completed_builds: "Завершені збірки",
    nav_updates: "Оновлення",
    current_build_title: "Поточна збірка",
    signup_btn: "Зареєструватися",
    login_link: "Увійти",
    theme_toggle_dark: "Темна",
    theme_toggle_light: "Світла",

    // Build Page - Header & Main Info
    new_build_btn: "+ Нова збірка",
    parts_list_title: "Список компонентів",
    compatibility_status_compatible: "Сумісно",
    compatibility_status_incompatible: "Несумісно",
    compatibility_status_unknown: "—",

    // Build Page - Gemini Features
    compatibility_advice_btn: "✨ Отримати пораду по сумісності",
    generate_description_btn: "✨ Згенерувати опис збірки",
    estimate_performance_btn: "✨ Оцінити продуктивність",
    gemini_modal_title_default: "Відповідь від AI",
    gemini_modal_title_description: "Опис Збірки",
    gemini_modal_title_compatibility: "Порада по Сумісності",
    gemini_modal_title_performance: "Оцінка Продуктивності",
    gemini_error_unexpected_response:
      "Не вдалося отримати відповідь від AI. Спробуйте ще раз.",

    // Build Page - Alerts & Prompts for Gemini
    alert_add_components_for_description:
      "Будь ласка, додайте компоненти до збірки, щоб згенерувати опис.",
    alert_add_min_two_components_for_compatibility:
      "Додайте принаймні два компоненти для аналізу сумісності.",
    alert_not_enough_crucial_components_for_compatibility:
      "Недостатньо ключових компонентів для детального аналізу сумісності.",
    alert_add_components_for_performance:
      "Будь ласка, додайте компоненти, щоб оцінити продуктивність.",
    compatibility_components_list_header: "Ключові компоненти для аналізу:",
    compatibility_advice_question:
      "Які основні моменти слід перевірити користувачеві (наприклад, сокет процесора та материнської плати, тип ОЗП та підтримка материнською платою, потужність БЖ, фізичні розміри)?",
    performance_components_list_header: "Компоненти для оцінки:",
    prompt_generate_description_uk_template:
      "Створи коротке (2-4 речення), привабливе та інформативне маркетингове описання для збірки ПК. Опис має бути на українській мові. Згадай, для яких завдань ця збірка може підійти (наприклад, ігри, робота, навчання, творчість). Компоненти:\n{partDetails}",
    prompt_compatibility_advice_uk_template:
      "Моя програма для збірки ПК показує, що наступна конфігурація є несумісною. Надай, будь ласка, на українській мові, можливі загальні причини несовмісності між цими компонентами та поради щодо їх перевірки. Не роби остаточних висновків, а лише припущення на основі наданої інформації.",
    prompt_estimate_performance_uk_template:
      "Будь ласка, на українській мові, дай загальну оцінку продуктивності та призначення наступної збірки ПК. Вкажи, для яких завдань (наприклад, сучасні ігри в розширенні 1080p/1440p/4K, стрімінг, відеомонтаж, 3D-моделювання, офісна робота, навчання) вона підходить. Відзнач сильні сторони збірки та можливі вузькі місця або дисбаланс компонентів, якщо такі є. Не наводь точних цифр FPS або результатів бенчмарків, оцінка має бути якісною.",

    // Quick Add Modal
    filters_title: "Фільтри",
    filter_compatibility_only: "Тільки сумісні",
    filter_3d_only: "Тільки 3D",
    filter_price: "Ціна",
    sort_by: "Сортувати за",
    sort_default: "За замовчуванням",
    sort_price_asc: "Ціна: від низької до високої",
    sort_price_desc: "Ціна: від високої до низької",
    search_by_name_placeholder: "Пошук за назвою...",
    rows_per_page: "Рядків на сторінку",
    products_found: "Знайдено {count} компонент(ів)",
    add_to_build_btn_text: "Додати до збірки",
    pagination_page_info: "Сторінка {currentPage} з {totalPages}",
    pagination_first_page: "Перша",
    pagination_prev_page: "Попередня",
    pagination_next_page: "Наступна",
    pagination_last_page: "Остання",
    yes_filter: "Так",
    no_filter: "Ні",
    error_loading_components_quickadd:
      "Помилка завантаження або обробки продуктів:",
    error_failed_to_load_components:
      "Не вдалося завантажити компоненти. Спробуйте ще раз.",
    error_product_not_found_by_id: "Продукт не знайдено за ID картки:",

    // Part Categories
    PCCase: "Корпус ПК",
    Motherboard: "Материнська плата",
    CPU: "Процесор",
    CPUCooler: "Охолодження процесора",
    GPU: "Відеокарта",
    RAM: "Оперативна пам'ять",
    Storage: "Накопичувач",
    PSU: "Блок живлення",
    NetworkCard: "Мережева карта",
    CaseFan: "Вентилятор корпусу",
    Monitor: "Монітор",
    SoundCard: "Звукова карта",

    // Spec Keys
    spec_key_form_factor: "Форм-фактор",
    spec_key_socket: "Сокет",
    spec_key_chipset: "Чіпсет",
    spec_key_memory_type: "Тип пам'яті",
    spec_key_ram_type: "Тип ОЗП",
    spec_key_capacity: "Об'єм",
    spec_key_cores: "Ядра",
    spec_key_threads: "Потоки",
    spec_key_base_clock: "Базова частота",
    spec_key_boost_clock: "Boost-частота",
    spec_key_memory_size: "Об'єм пам'яті",
    spec_key_interface: "Інтерфейс",
    spec_key_length_mm: "Довжина (мм)",
    spec_key_max_gpu_length_mm: "Макс. довжина GPU (мм)",
    spec_key_max_cpu_cooler_height_mm: "Макс. висота кулера CPU (мм)",
    spec_key_wattage: "Потужність",
    spec_key_efficiency_rating: "Рейтинг ефективності",
    spec_key_modular: "Модульність",
    spec_key_type: "Тип",
    spec_key_speed_mhz: "Швидкість (МГц)",
    spec_key_side_panel: "Бічна панель",
    spec_key_power_supply: "Блок живлення",
    spec_key_rpm_min: "Оберти (хв)",
    spec_key_rpm_max: "Оберти (макс)",
    spec_key_noise_level_min: "Рівень шуму (мін дБА)",
    spec_key_noise_level_max: "Рівень шуму (макс дБА)",
    spec_key_water_cooled: "Водяне охолодження",
    spec_key_screen_size: "Розмір екрану",
    spec_key_resolution: "Роздільна здатність",
    spec_key_refresh_rate: "Частота оновлення",
    spec_key_panel_type: "Тип панелі",
    spec_key_modules: "Модулі",
    spec_key_nvme: "NVMe",
    spec_key_ecc: "ECC",
    spec_key_registered: "Registered",
    spec_key_heat_spreader: "Радіатор",
    spec_key_rgb: "RGB-підсвічування",
    spec_key_microarchitecture: "Мікроархітектура",
    spec_key_integrated_graphics: "Вбудована графіка",
    spec_key_specifications_integratedgraphics_model:
      "Модель вбудованої графіки",
    spec_key_memory_ram_type: "Тип ОЗП (Пам'ять)",
    spec_key_metadata_manufacturer: "Виробник",
    spec_key_resolution_verticalres: "Вертикальна роздільна здатність",
    spec_key_resolution_horizontalres: "Горизонтальна роздільна здатність",
    spec_key_ssd: "SSD", // Пример для типа накопителя
    spec_key_hdd: "HDD", // Пример для типа накопителя

    // Labels for Gemini prompts
    socket_label: "Сокет",
    chipset_label: "Чіпсет",
    ram_type_label: "Тип ОЗП",
    type_label: "Тип",
    length_label: "Довжина",
    wattage_label: "Потужність",
    max_gpu_length_label: "Макс. довжина GPU",
    cores_label: "ядер",
    threads_label: "потоків",
    category_label: "Категорія",
    spec_table_header_spec: "Характеристика",
    spec_table_header_value: "Значення",
    add_to_build_btn_modal: "Додати до збірки",
    affiliate_disclaimer:
      "* BuildCores може отримувати компенсацію за партнерські продажі за цими посиланнями",

    // Saved Builds Page
    please_login_to_see_builds:
      "Будь ласка, увійдіть, щоб переглянути збережені збірки.",
    error_loading_build_list_status: "Не вдалося завантажити список збірок",
    no_builds_found: "Збірок не знайдено.",
    error_loading_build_list: "Помилка завантаження списку збірок.",
    error_loading_build_status: "Не вдалося завантажити збірку",
    error_loading_component_status: "Не вдалося завантажити компонент",
    alert_login_to_create_build:
      "Будь ласка, увійдіть, щоб створити нову збірку.",
    error_creating_build_status: "Не вдалося створити нову збірку",
    alert_error_creating_build:
      "Не вдалося створити нову збірку. Спробуйте ще раз.",
    confirm_delete_build_message:
      "Ви впевнені, що хочете видалити збірку '{buildName}'?",
    error_deleting_build: "Не вдалося видалити збірку.",
    error_alert_deleting_build: "Сталася помилка під час видалення.",
    load_button_text: "Завантажити",
    delete_button_text: "Видалити",
    created_at_text: "Створено",
  },
};

let currentLanguage = localStorage.getItem("language") || "uk";

function setLanguage(lang) {
  if (translations[lang]) {
    currentLanguage = lang;
    localStorage.setItem("language", lang);
    document.documentElement.lang = lang;
    translatePage();
    window.dispatchEvent(
      new CustomEvent("languageChanged", { detail: { lang } })
    );
  } else {
    console.warn(
      `Language "${lang}" not found in translations. Defaulting to "${currentLanguage}".`
    );
  }
}

function translatePage() {
  document.querySelectorAll("[data-translate]").forEach((el) => {
    const key = el.dataset.translate;
    el.textContent = getTranslation(key);
  });

  document.querySelectorAll("[data-translate-placeholder]").forEach((el) => {
    const key = el.dataset.translatePlaceholder;
    el.placeholder = getTranslation(key);
  });

  document.querySelectorAll("[data-translate-category]").forEach((el) => {
    const categoryKey = el.dataset.translateCategory;
    el.textContent = getTranslation(categoryKey);
  });

  document
    .querySelectorAll("button.add-btn[data-translate-btn-add]")
    .forEach((btn) => {
      const categoryKey = btn.dataset.translateBtnAdd;
      const prefix = getTranslation("add_btn_prefix");
      const categoryName = getTranslation(categoryKey);
      if (!btn.classList.contains("swap-btn")) {
        btn.textContent = prefix + categoryName;
      } else {
        btn.textContent = getTranslation("swap_btn_text");
      }
    });

  const pageTitleEl = document.getElementById("pageTitle");
  if (pageTitleEl) {
    pageTitleEl.textContent = getTranslation("pageTitle");
  }
}

export function getTranslation(key, lang = currentLanguage, replacements) {
  let text = translations[lang]?.[key] || key;
  if (replacements) {
    for (const placeholder in replacements) {
      const regex = new RegExp(`{${placeholder}}`, "g");
      text = text.replace(regex, replacements[placeholder]);
    }
  }
  return text;
}

export function translateDynamicElement(element, translationKey, replacements) {
  if (element) {
    element.textContent = getTranslation(
      translationKey,
      currentLanguage,
      replacements
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const languageSwitcher = document.getElementById("language-switcher");
  if (languageSwitcher) {
    languageSwitcher.value = currentLanguage;
    languageSwitcher.addEventListener("change", (event) => {
      setLanguage(event.target.value);
    });
  }
  setLanguage(currentLanguage);
});

export { currentLanguage, setLanguage, translatePage };
