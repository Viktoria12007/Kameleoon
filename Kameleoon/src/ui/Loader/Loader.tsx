import { createPortal } from "react-dom";
import styles from "./styles.module.css";

export default function Loader() {
    return createPortal(<div className={styles.loader}>Loading...</div>, document.body)
}
