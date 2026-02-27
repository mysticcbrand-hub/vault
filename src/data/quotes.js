export const REST_DAY_QUOTES = [
  { quote: "El descanso no es debilidad. Es parte del proceso.", author: "Greg Nuckols" },
  { quote: "La supercompensación ocurre en el descanso, no en el gym.", author: "GRAW" },
  { quote: "Hoy descansas. Mañana levantas más.", author: "GRAW" },
  { quote: "El músculo crece mientras duermes.", author: "Ciencia del Ejercicio" },
  { quote: "Los mejores atletas del mundo priorizan la recuperación.", author: "GRAW" },
  { quote: "Un día de descanso hoy es un PR mañana.", author: "GRAW" },
  { quote: "La consistencia a largo plazo supera la intensidad a corto plazo.", author: "GRAW" },
  { quote: "Recuperación activa: camina, estira, respira.", author: "GRAW" },
]

export const MORNING_QUOTES = [
  "El que madruga, levanta más.",
  "Otra sesión. Otro paso hacia adelante.",
  "Hoy es un buen día para un PR.",
]

export function getRandomRestQuote() {
  return REST_DAY_QUOTES[Math.floor(Math.random() * REST_DAY_QUOTES.length)]
}
