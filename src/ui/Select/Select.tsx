import { useState, useRef, useEffect } from "react";
import styles from "./styles.module.css";

export default function Select({ options = [], value, onChange, placeholder = "Select option" }) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        }

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    return (
        <div className={styles.selectWrapper} ref={wrapperRef}>
            <div tabIndex={0} role="select" className={styles.selectControl} onClick={() => setOpen(!open)}>
                <span>{value ? value.label : placeholder}</span>
                <div className={styles.arrow}>{open ? "▲" : "▼"}</div>
            </div>

            { open && (
                <ul className={styles.selectDropdown}>
                    { options.filter(item => item.value !== value?.value).map((opt) => (
                        <li
                            key={opt.value}
                            role="option"
                            className={`${styles.selectOption} ${value?.value === opt.value ? "selected" : ""}`}
                            onClick={() => {
                                onChange(opt);
                                setOpen(false);
                            }}
                        >
                            {opt.label}
                        </li>
                    )) }
                </ul>
            )}
        </div>
    );
}
