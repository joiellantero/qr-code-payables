import Deck from './Deck'
import { BGPattern } from './BGPattern'
import styles from './styles.module.css'

export default function App() {
  return (
    <div className={`flex fill center ${styles.container}`}>
        <BGPattern variant="dots" mask="fade-edges" size={20} fill="rgba(255,255,255,0.18)" />
        <Deck />
    </div>
  )
}
