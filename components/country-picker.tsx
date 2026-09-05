"use client";

import { useState, useMemo, useRef, useEffect, useDeferredValue } from "react";
import { Search, ArrowUp, ArrowDown, CornerDownLeft, X, Check } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";

const springSnappy = { type: "spring" as const, stiffness: 520, damping: 34, mass: 0.72 };
const springPill = { type: "spring" as const, stiffness: 420, damping: 32, mass: 0.55 };
const springMicro = { type: "spring" as const, stiffness: 620, damping: 28, mass: 0.6 };
const tweenOut = { duration: 0.16, ease: [0.16, 1, 0.3, 1] as const };

type Country = {
  name: string;
  code: string;
  flag: string;
};

const COUNTRIES: Country[] = [
  { name: "Afghanistan", code: "AF", flag: "🇦🇫" },
  { name: "Åland Islands", code: "AX", flag: "🇦🇽" },
  { name: "Albania", code: "AL", flag: "🇦🇱" },
  { name: "Algeria", code: "DZ", flag: "🇩🇿" },
  { name: "American Samoa", code: "AS", flag: "🇦🇸" },
  { name: "Andorra", code: "AD", flag: "🇦🇩" },
  { name: "Angola", code: "AO", flag: "🇦🇴" },
  { name: "Anguilla", code: "AI", flag: "🇦🇮" },
  { name: "Antarctica", code: "AQ", flag: "🇦🇶" },
  { name: "Antigua & Barbuda", code: "AG", flag: "🇦🇬" },
  { name: "Argentina", code: "AR", flag: "🇦🇷" },
  { name: "Armenia", code: "AM", flag: "🇦🇲" },
  { name: "Aruba", code: "AW", flag: "🇦🇼" },
  { name: "Australia", code: "AU", flag: "🇦🇺" },
  { name: "Austria", code: "AT", flag: "🇦🇹" },
  { name: "Azerbaijan", code: "AZ", flag: "🇦🇿" },
  { name: "Bahamas", code: "BS", flag: "🇧🇸" },
  { name: "Bahrain", code: "BH", flag: "🇧🇭" },
  { name: "Bangladesh", code: "BD", flag: "🇧🇩" },
  { name: "Barbados", code: "BB", flag: "🇧🇧" },
  { name: "Belarus", code: "BY", flag: "🇧🇾" },
  { name: "Belgium", code: "BE", flag: "🇧🇪" },
  { name: "Belize", code: "BZ", flag: "🇧🇿" },
  { name: "Benin", code: "BJ", flag: "🇧🇯" },
  { name: "Bermuda", code: "BM", flag: "🇧🇲" },
  { name: "Bhutan", code: "BT", flag: "🇧🇹" },
  { name: "Bolivia", code: "BO", flag: "🇧🇴" },
  { name: "Bosnia & Herzegovina", code: "BA", flag: "🇧🇦" },
  { name: "Botswana", code: "BW", flag: "🇧🇼" },
  { name: "Brazil", code: "BR", flag: "🇧🇷" },
  { name: "British Indian Ocean Territory", code: "IO", flag: "🇮🇴" },
  { name: "Brunei", code: "BN", flag: "🇧🇳" },
  { name: "Bulgaria", code: "BG", flag: "🇧🇬" },
  { name: "Burkina Faso", code: "BF", flag: "🇧🇫" },
  { name: "Burundi", code: "BI", flag: "🇧🇮" },
  { name: "Cambodia", code: "KH", flag: "🇰🇭" },
  { name: "Cameroon", code: "CM", flag: "🇨🇲" },
  { name: "Canada", code: "CA", flag: "🇨🇦" },
  { name: "Cape Verde", code: "CV", flag: "🇨🇻" },
  { name: "Cayman Islands", code: "KY", flag: "🇰🇾" },
  { name: "Central African Republic", code: "CF", flag: "🇨🇫" },
  { name: "Chad", code: "TD", flag: "🇹🇩" },
  { name: "Chile", code: "CL", flag: "🇨🇱" },
  { name: "China", code: "CN", flag: "🇨🇳" },
  { name: "Christmas Island", code: "CX", flag: "🇨🇽" },
  { name: "Cocos (Keeling) Islands", code: "CC", flag: "🇨🇨" },
  { name: "Colombia", code: "CO", flag: "🇨🇴" },
  { name: "Comoros", code: "KM", flag: "🇰🇲" },
  { name: "Congo - Brazzaville", code: "CG", flag: "🇨🇬" },
  { name: "Congo - Kinshasa", code: "CD", flag: "🇨🇩" },
  { name: "Cook Islands", code: "CK", flag: "🇨🇰" },
  { name: "Costa Rica", code: "CR", flag: "🇨🇷" },
  { name: "Côte d’Ivoire", code: "CI", flag: "🇨🇮" },
  { name: "Croatia", code: "HR", flag: "🇭🇷" },
  { name: "Cuba", code: "CU", flag: "🇨🇺" },
  { name: "Curaçao", code: "CW", flag: "🇨🇼" },
  { name: "Cyprus", code: "CY", flag: "🇨🇾" },
  { name: "Czechia", code: "CZ", flag: "🇨🇿" },
  { name: "Denmark", code: "DK", flag: "🇩🇰" },
  { name: "Djibouti", code: "DJ", flag: "🇩🇯" },
  { name: "Dominica", code: "DM", flag: "🇩🇲" },
  { name: "Dominican Republic", code: "DO", flag: "🇩🇴" },
  { name: "Ecuador", code: "EC", flag: "🇪🇨" },
  { name: "Egypt", code: "EG", flag: "🇪🇬" },
  { name: "El Salvador", code: "SV", flag: "🇸🇻" },
  { name: "Equatorial Guinea", code: "GQ", flag: "🇬🇶" },
  { name: "Eritrea", code: "ER", flag: "🇪🇷" },
  { name: "Estonia", code: "EE", flag: "🇪🇪" },
  { name: "Eswatini", code: "SZ", flag: "🇸🇿" },
  { name: "Ethiopia", code: "ET", flag: "🇪🇹" },
  { name: "Falkland Islands", code: "FK", flag: "🇫🇰" },
  { name: "Faroe Islands", code: "FO", flag: "🇫🇴" },
  { name: "Fiji", code: "FJ", flag: "🇫🇯" },
  { name: "Finland", code: "FI", flag: "🇫🇮" },
  { name: "France", code: "FR", flag: "🇫🇷" },
  { name: "French Guiana", code: "GF", flag: "🇬🇫" },
  { name: "French Polynesia", code: "PF", flag: "🇵🇫" },
  { name: "Gabon", code: "GA", flag: "🇬🇦" },
  { name: "Gambia", code: "GM", flag: "🇬🇲" },
  { name: "Georgia", code: "GE", flag: "🇬🇪" },
  { name: "Germany", code: "DE", flag: "🇩🇪" },
  { name: "Ghana", code: "GH", flag: "🇬🇭" },
  { name: "Gibraltar", code: "GI", flag: "🇬🇮" },
  { name: "Greece", code: "GR", flag: "🇬🇷" },
  { name: "Greenland", code: "GL", flag: "🇬🇱" },
  { name: "Grenada", code: "GD", flag: "🇬🇩" },
  { name: "Guadeloupe", code: "GP", flag: "🇬🇵" },
  { name: "Guam", code: "GU", flag: "🇬🇺" },
  { name: "Guatemala", code: "GT", flag: "🇬🇹" },
  { name: "Guernsey", code: "GG", flag: "🇬🇬" },
  { name: "Guinea", code: "GN", flag: "🇬🇳" },
  { name: "Guinea-Bissau", code: "GW", flag: "🇬🇼" },
  { name: "Guyana", code: "GY", flag: "🇬🇾" },
  { name: "Haiti", code: "HT", flag: "🇭🇹" },
  { name: "Honduras", code: "HN", flag: "🇭🇳" },
  { name: "Hong Kong SAR China", code: "HK", flag: "🇭🇰" },
  { name: "Hungary", code: "HU", flag: "🇭🇺" },
  { name: "Iceland", code: "IS", flag: "🇮🇸" },
  { name: "India", code: "IN", flag: "🇮🇳" },
  { name: "Indonesia", code: "ID", flag: "🇮🇩" },
  { name: "Iran", code: "IR", flag: "🇮🇷" },
  { name: "Iraq", code: "IQ", flag: "🇮🇶" },
  { name: "Ireland", code: "IE", flag: "🇮🇪" },
  { name: "Isle of Man", code: "IM", flag: "🇮🇲" },
  { name: "Israel", code: "IL", flag: "🇮🇱" },
  { name: "Italy", code: "IT", flag: "🇮🇹" },
  { name: "Jamaica", code: "JM", flag: "🇯🇲" },
  { name: "Japan", code: "JP", flag: "🇯🇵" },
  { name: "Jersey", code: "JE", flag: "🇯🇪" },
  { name: "Jordan", code: "JO", flag: "🇯🇴" },
  { name: "Kazakhstan", code: "KZ", flag: "🇰🇿" },
  { name: "Kenya", code: "KE", flag: "🇰🇪" },
  { name: "Kiribati", code: "KI", flag: "🇰🇮" },
  { name: "North Korea", code: "KP", flag: "🇰🇵" },
  { name: "South Korea", code: "KR", flag: "🇰🇷" },
  { name: "Kuwait", code: "KW", flag: "🇰🇼" },
  { name: "Kyrgyzstan", code: "KG", flag: "🇰🇬" },
  { name: "Laos", code: "LA", flag: "🇱🇦" },
  { name: "Latvia", code: "LV", flag: "🇱🇻" },
  { name: "Lebanon", code: "LB", flag: "🇱🇧" },
  { name: "Lesotho", code: "LS", flag: "🇱🇸" },
  { name: "Liberia", code: "LR", flag: "🇱🇷" },
  { name: "Libya", code: "LY", flag: "🇱🇾" },
  { name: "Liechtenstein", code: "LI", flag: "🇱🇮" },
  { name: "Lithuania", code: "LT", flag: "🇱🇹" },
  { name: "Luxembourg", code: "LU", flag: "🇱🇺" },
  { name: "Macao SAR China", code: "MO", flag: "🇲🇴" },
  { name: "Madagascar", code: "MG", flag: "🇲🇬" },
  { name: "Malawi", code: "MW", flag: "🇲🇼" },
  { name: "Malaysia", code: "MY", flag: "🇲🇾" },
  { name: "Maldives", code: "MV", flag: "🇲🇻" },
  { name: "Mali", code: "ML", flag: "🇲🇱" },
  { name: "Malta", code: "MT", flag: "🇲🇹" },
  { name: "Marshall Islands", code: "MH", flag: "🇲🇭" },
  { name: "Martinique", code: "MQ", flag: "🇲🇶" },
  { name: "Mauritania", code: "MR", flag: "🇲🇷" },
  { name: "Mauritius", code: "MU", flag: "🇲🇺" },
  { name: "Mayotte", code: "YT", flag: "🇾🇹" },
  { name: "Mexico", code: "MX", flag: "🇲🇽" },
  { name: "Micronesia", code: "FM", flag: "🇫🇲" },
  { name: "Moldova", code: "MD", flag: "🇲🇩" },
  { name: "Monaco", code: "MC", flag: "🇲🇨" },
  { name: "Mongolia", code: "MN", flag: "🇲🇳" },
  { name: "Montenegro", code: "ME", flag: "🇲🇪" },
  { name: "Montserrat", code: "MS", flag: "🇲🇸" },
  { name: "Morocco", code: "MA", flag: "🇲🇦" },
  { name: "Mozambique", code: "MZ", flag: "🇲🇿" },
  { name: "Myanmar (Burma)", code: "MM", flag: "🇲🇲" },
  { name: "Namibia", code: "NA", flag: "🇳🇦" },
  { name: "Nauru", code: "NR", flag: "🇳🇷" },
  { name: "Nepal", code: "NP", flag: "🇳🇵" },
  { name: "Netherlands", code: "NL", flag: "🇳🇱" },
  { name: "New Caledonia", code: "NC", flag: "🇳🇨" },
  { name: "New Zealand", code: "NZ", flag: "🇳🇿" },
  { name: "Nicaragua", code: "NI", flag: "🇳🇮" },
  { name: "Niger", code: "NE", flag: "🇳🇪" },
  { name: "Nigeria", code: "NG", flag: "🇳🇬" },
  { name: "Niue", code: "NU", flag: "🇳🇺" },
  { name: "Norfolk Island", code: "NF", flag: "🇳🇫" },
  { name: "North Macedonia", code: "MK", flag: "🇲🇰" },
  { name: "Northern Mariana Islands", code: "MP", flag: "🇲🇵" },
  { name: "Norway", code: "NO", flag: "🇳🇴" },
  { name: "Oman", code: "OM", flag: "🇴🇲" },
  { name: "Pakistan", code: "PK", flag: "🇵🇰" },
  { name: "Palau", code: "PW", flag: "🇵🇼" },
  { name: "Palestinian Territories", code: "PS", flag: "🇵🇸" },
  { name: "Panama", code: "PA", flag: "🇵🇦" },
  { name: "Papua New Guinea", code: "PG", flag: "🇵🇬" },
  { name: "Paraguay", code: "PY", flag: "🇵🇾" },
  { name: "Peru", code: "PE", flag: "🇵🇪" },
  { name: "Philippines", code: "PH", flag: "🇵🇭" },
  { name: "Pitcairn Islands", code: "PN", flag: "🇵🇳" },
  { name: "Poland", code: "PL", flag: "🇵🇱" },
  { name: "Portugal", code: "PT", flag: "🇵🇹" },
  { name: "Puerto Rico", code: "PR", flag: "🇵🇷" },
  { name: "Qatar", code: "QA", flag: "🇶🇦" },
  { name: "Réunion", code: "RE", flag: "🇷🇪" },
  { name: "Romania", code: "RO", flag: "🇷🇴" },
  { name: "Russia", code: "RU", flag: "🇷🇺" },
  { name: "Rwanda", code: "RW", flag: "🇷🇼" },
  { name: "Samoa", code: "WS", flag: "🇼🇸" },
  { name: "San Marino", code: "SM", flag: "🇸🇲" },
  { name: "São Tomé & Príncipe", code: "ST", flag: "🇸🇹" },
  { name: "Saudi Arabia", code: "SA", flag: "🇸🇦" },
  { name: "Senegal", code: "SN", flag: "🇸🇳" },
  { name: "Serbia", code: "RS", flag: "🇷🇸" },
  { name: "Seychelles", code: "SC", flag: "🇸🇨" },
  { name: "Sierra Leone", code: "SL", flag: "🇸🇱" },
  { name: "Singapore", code: "SG", flag: "🇸🇬" },
  { name: "Sint Maarten", code: "SX", flag: "🇸🇽" },
  { name: "Slovakia", code: "SK", flag: "🇸🇰" },
  { name: "Slovenia", code: "SI", flag: "🇸🇮" },
  { name: "Solomon Islands", code: "SB", flag: "🇸🇧" },
  { name: "Somalia", code: "SO", flag: "🇸🇴" },
  { name: "South Africa", code: "ZA", flag: "🇿🇦" },
  { name: "South Georgia & South Sandwich Islands", code: "GS", flag: "🇬🇸" },
  { name: "South Sudan", code: "SS", flag: "🇸🇸" },
  { name: "Spain", code: "ES", flag: "🇪🇸" },
  { name: "Sri Lanka", code: "LK", flag: "🇱🇰" },
  { name: "St. Barthélemy", code: "BL", flag: "🇧🇱" },
  { name: "St. Helena", code: "SH", flag: "🇸🇭" },
  { name: "St. Kitts & Nevis", code: "KN", flag: "🇰🇳" },
  { name: "St. Lucia", code: "LC", flag: "🇱🇨" },
  { name: "St. Martin", code: "MF", flag: "🇲🇫" },
  { name: "St. Pierre & Miquelon", code: "PM", flag: "🇵🇲" },
  { name: "St. Vincent & Grenadines", code: "VC", flag: "🇻🇨" },
  { name: "Sudan", code: "SD", flag: "🇸🇩" },
  { name: "Suriname", code: "SR", flag: "🇸🇷" },
  { name: "Svalbard & Jan Mayen", code: "SJ", flag: "🇸🇯" },
  { name: "Sweden", code: "SE", flag: "🇸🇪" },
  { name: "Switzerland", code: "CH", flag: "🇨🇭" },
  { name: "Syria", code: "SY", flag: "🇸🇾" },
  { name: "Taiwan", code: "TW", flag: "🇹🇼" },
  { name: "Tajikistan", code: "TJ", flag: "🇹🇯" },
  { name: "Tanzania", code: "TZ", flag: "🇹🇿" },
  { name: "Thailand", code: "TH", flag: "🇹🇭" },
  { name: "Timor-Leste", code: "TL", flag: "🇹🇱" },
  { name: "Togo", code: "TG", flag: "🇹🇬" },
  { name: "Tokelau", code: "TK", flag: "🇹🇰" },
  { name: "Tonga", code: "TO", flag: "🇹🇴" },
  { name: "Trinidad & Tobago", code: "TT", flag: "🇹🇹" },
  { name: "Tunisia", code: "TN", flag: "🇹🇳" },
  { name: "Turkey", code: "TR", flag: "🇹🇷" },
  { name: "Turkmenistan", code: "TM", flag: "🇹🇲" },
  { name: "Turks & Caicos Islands", code: "TC", flag: "🇹🇨" },
  { name: "Tuvalu", code: "TV", flag: "🇹🇻" },
  { name: "Uganda", code: "UG", flag: "🇺🇬" },
  { name: "Ukraine", code: "UA", flag: "🇺🇦" },
  { name: "United Arab Emirates", code: "AE", flag: "🇦🇪" },
  { name: "United Kingdom", code: "GB", flag: "🇬🇧" },
  { name: "United States of America", code: "US", flag: "🇺🇸" },
  { name: "Uruguay", code: "UY", flag: "🇺🇾" },
  { name: "Uzbekistan", code: "UZ", flag: "🇺🇿" },
  { name: "Vanuatu", code: "VU", flag: "🇻🇺" },
  { name: "Vatican City", code: "VA", flag: "🇻🇦" },
  { name: "Venezuela", code: "VE", flag: "🇻🇪" },
  { name: "Vietnam", code: "VN", flag: "🇻🇳" },
  { name: "Virgin Islands (British)", code: "VG", flag: "🇻🇬" },
  { name: "Virgin Islands (U.S.)", code: "VI", flag: "🇻🇮" },
  { name: "Wallis & Futuna", code: "WF", flag: "🇼🇫" },
  { name: "Western Sahara", code: "EH", flag: "🇪🇭" },
  { name: "Yemen", code: "YE", flag: "🇾🇪" },
  { name: "Zambia", code: "ZM", flag: "🇿🇲" },
  { name: "Zimbabwe", code: "ZW", flag: "🇿🇼" },
];

export function CountryPicker() {
  const shouldReduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [selected, setSelected] = useState<string>("AF");
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!deferredQuery.trim()) return COUNTRIES;
    const q = deferredQuery.toLowerCase();
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q));
  }, [deferredQuery]);

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [deferredQuery]);

  const isSearching = query.trim().length > 0;

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[activeIndex]) {
        setSelected(filtered[activeIndex].code);
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setQuery("");
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Scroll active keyboard item into view
  useEffect(() => {
    if (!listRef.current || !isOpen) return;
    const activeEl = listRef.current.children[activeIndex] as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest", behavior: "instant" });
    }
  }, [activeIndex, isOpen]);

  return (
    <LayoutGroup>
      <div
        ref={containerRef}
        className="relative w-full max-w-md select-none font-sans"
        onKeyDown={handleKeyDown}
      >
      <div
        className={`flex items-center gap-2 rounded-2xl border bg-white px-4 py-2.5 transition-[border-color,box-shadow] duration-200 dark:bg-neutral-900 ${
          isOpen
            ? "border-neutral-300 shadow-[0_0_0_4px_rgba(0,0,0,0.04),0_1px_2px_0_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,1)] dark:border-neutral-700 dark:shadow-[0_0_0_4px_rgba(255,255,255,0.04),0_1px_2px_0_rgba(0,0,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.04)]"
            : "border-neutral-200 shadow-[0_1px_2px_0_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,1)] dark:border-neutral-800 dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.04)]"
        }`}
      >
        <Search className="h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          placeholder={`Search ${COUNTRIES.length} countries`}
          className="flex-1 min-w-0 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 outline-none dark:text-neutral-100 dark:placeholder:text-neutral-500"
        />

        <AnimatePresence mode="popLayout" initial={false}>
          {isSearching ? (
            <motion.div
              key="searching"
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.85, x: 6 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85, x: 6 }}
              transition={shouldReduceMotion ? { duration: 0 } : springMicro}
              className="flex items-center gap-1.5"
            >
              <motion.span
                key={filtered.length}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                className="shrink-0 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-medium tabular-nums text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
              >
                {filtered.length}
              </motion.span>
              <motion.button
                type="button"
                whileTap={shouldReduceMotion ? undefined : { scale: 0.88 }}
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 text-neutral-400 hover:text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                <X className="h-3 w-3" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="esc"
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
              transition={shouldReduceMotion ? { duration: 0 } : springMicro}
              className="shrink-0 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-medium text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
            >
              esc
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -8, scale: 0.96 }
            }
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, scale: 1 }
            }
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -6, scale: 0.98 }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { ...springSnappy, opacity: tweenOut }
            }
            style={{ originX: 0.5, originY: 0 }}
            className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden rounded-2xl border border-neutral-200 bg-white/95 backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06),0_12px_32px_-4px_rgba(0,0,0,0.12)] dark:border-neutral-800 dark:bg-neutral-900/95 dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.4),0_12px_32px_-4px_rgba(0,0,0,0.6)]"
          >
            <div
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              className="max-h-80 overflow-y-auto p-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar-thumb]:hidden [&::-webkit-scrollbar-track]:hidden"
            >
              <div ref={listRef} className="flex flex-col gap-0.5">
                {filtered.length === 0 ? (
                  <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={shouldReduceMotion ? { duration: 0 } : springSnappy}
                    className="flex flex-col items-center justify-center gap-1 py-10 text-center"
                  >
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      No countries found
                    </span>
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">
                      Try a different search
                    </span>
                  </motion.div>
                ) : (
                  filtered.map((country, idx) => {
                    const isSelected = country.code === selected;
                    const isActive = idx === activeIndex;

                    return (
                      <motion.button
                        key={country.code}
                        type="button"
                        onClick={() => {
                          setSelected(country.code);
                          setActiveIndex(idx);
                          setIsOpen(false);
                        }}
                        onMouseEnter={() => setActiveIndex(idx)}
                        initial={
                          shouldReduceMotion || idx >= 10
                            ? false
                            : { opacity: 0, y: 8 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        transition={
                          shouldReduceMotion
                            ? { duration: 0 }
                            : { ...springSnappy, delay: 0.03 + idx * 0.018 }
                        }
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                        className="relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left outline-none"
                      >
                        {isActive && (
                          <motion.div
                            layoutId="active-pill"
                            transition={
                              shouldReduceMotion ? { duration: 0 } : springPill
                            }
                            className="absolute inset-0 rounded-xl bg-neutral-100 dark:bg-neutral-800"
                          />
                        )}

                        <span className="relative z-10 text-base shrink-0 leading-none">
                          {country.flag}
                        </span>

                        <span
                          className={`relative z-10 flex-1 text-sm ${
                            isSelected
                              ? "font-semibold text-neutral-900 dark:text-neutral-100"
                              : "text-neutral-700 dark:text-neutral-300"
                          }`}
                        >
                          {highlightMatch(country.name, deferredQuery)}
                        </span>

                        <AnimatePresence initial={false}>
                          {isSelected && (
                            <motion.span
                              key="check"
                              initial={
                                shouldReduceMotion
                                  ? false
                                  : { scale: 0.4, opacity: 0 }
                              }
                              animate={{ scale: 1, opacity: 1 }}
                              exit={
                                shouldReduceMotion
                                  ? { opacity: 0 }
                                  : { scale: 0.4, opacity: 0 }
                              }
                              transition={
                                shouldReduceMotion ? { duration: 0 } : springMicro
                              }
                              className="relative z-10 text-neutral-800 dark:text-neutral-200"
                            >
                              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                            </motion.span>
                          )}
                        </AnimatePresence>

                        <span
                          className={`relative z-10 shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-wide ${
                            isSelected
                              ? "border-neutral-300 bg-white text-neutral-800 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-300"
                              : "border-neutral-200 bg-neutral-50 text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                          }`}
                        >
                          {country.code}
                        </span>
                      </motion.button>
                    );
                  })
                )}
              </div>
            </div>

            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { delay: 0.08, duration: 0.2 }
              }
              className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50/80 px-4 py-2.5 dark:border-neutral-800 dark:bg-neutral-800/40"
            >
              <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-1 self-center">
                  <KeyIcon>
                    <ArrowUp className="h-2.5 w-2.5" />
                  </KeyIcon>
                  <KeyIcon>
                    <ArrowDown className="h-2.5 w-2.5" />
                  </KeyIcon>
                  <span className="ml-1">move</span>
                </div>
                <div className="flex items-center gap-1 self-center">
                  <KeyIcon>
                    <CornerDownLeft className="h-2.5 w-2.5" />
                  </KeyIcon>
                  <span className="ml-1">select</span>
                </div>
              </div>

              <motion.span
                key={filtered.length}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.16, ease: [0.16, 1, 0.3, 1] }
                }
                className="text-[11px] tabular-nums text-neutral-400 dark:text-neutral-500 font-medium"
              >
                {filtered.length} {filtered.length === 1 ? "country" : "countries"}
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </LayoutGroup>
  );
}

function KeyIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-500 shadow-[0_1px_0_0_rgba(0,0,0,0.04)] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
      {children}
    </div>
  );
}

function highlightMatch(text: string, query: string) {
  const q = query.trim();
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-[3px] bg-yellow-200/80 px-0.5 font-semibold text-neutral-900 dark:bg-yellow-500/30 dark:text-neutral-100">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}
