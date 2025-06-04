export const obfuscateEmail = (email: string): string => {
  return email
    .split('')
    .map((char) => `&#${char.charCodeAt(0)};`)
    .join('')
}

export const obfuscatePhone = (phone: string): string => {
  return btoa(phone)
}

export const decodeEmail = (encodedEmail: string): string => {
  const temp = document.createElement('div')
  temp.innerHTML = encodedEmail
  return temp.textContent || temp.innerText || ''
}

export const decodePhone = (encodedPhone: string): string => {
  return atob(encodedPhone)
}

export const useDelayedReveal = (delay: number = 1000) => {
  const [isRevealed, setIsRevealed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return isRevealed
}

export const validateHumanInteraction = () => {
  let humanScore = 0

  if (typeof window !== 'undefined') {
    if (window.scrollY > 0) humanScore++

    if (sessionStorage.getItem('mouseMovement')) humanScore++

    const startTime = sessionStorage.getItem('pageStartTime')
    if (startTime && Date.now() - parseInt(startTime) > 3000) humanScore++
  }

  return humanScore >= 2
}
