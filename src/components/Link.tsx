/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

// CREDITS: https://gist.github.com/khuezy/34fd7fe245018887f86691463262dcba

/**
 * The next/link is poorly designed; as it makes a network request on all links simultaneously,
 * which DDOS the server and consumes the user device CPU over 100%.
 * This version defers the requests to be run serially to prevent the spam and prevents CPU overload.
 *
 * On mobile/tablets, all links are prefetch serially (since there's no hover state) when they come in view.
 * On desktop, links are prefetch on hover.
 */

import { useCallback, useEffect, useRef, useState, type RefObject, type MouseEvent, type AnchorHTMLAttributes } from 'react'
import { useRouter } from 'next/navigation'
import { type AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

const queue: string[] = []
const fetched = new Set<string>()

let router: AppRouterInstance

// A global generator to queue up fetch requests
async function* prefetch(): any {
  while (true) {
    while (queue.length) {
      await router.prefetch(queue.shift()!)
    }
    yield
  }
}
const generator = prefetch()

// For phones and tablets, prefetch all links in view
function TouchLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  router = useRouter()
  const href = props.href ?? ''

  const ref = useRef<HTMLAnchorElement>(null)
  const onScreen = useOnScreen(ref)

  // Queue up prefetch
  useEffect(() => {
    if (!onScreen || fetched.has(href)) return
    queue.push(href)
    generator.next()
    fetched.add(href)
  }, [href, onScreen])

  const onClick = useCallback(function onClick(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    router.push(href)
  }, [href])

  return <a ref={ref} {...props} onClick={onClick} />
}

// For nonphone/tablet devices, only prefetch on link hover
function DesktopLink({ scrolling, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { scrolling?: boolean }) {
  router = useRouter()
  const href = props.href ?? ''
  const onClick = useCallback(function onClick(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    router.push(href)
  }, [href])

  const onHover = useCallback(function onClick(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    router.prefetch(href)
  }, [href])
  return <a {...props} onClick={onClick} onMouseEnter={scrolling ? undefined : onHover} />
}

export default function Link(props: AnchorHTMLAttributes<HTMLAnchorElement> & { scrolling?: boolean }) {
  return hasTouch() ? <TouchLink {...props} /> : <DesktopLink {...props} />
}


function useOnScreen(ref?: RefObject<HTMLElement>, rootMargin = '0px') {
  const [isIntersecting, setIntersecting] = useState(false)
  const r = ref?.current
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if(entry){
          setIntersecting(entry.isIntersecting)
        }
      }, { rootMargin }
    )
    r && observer.observe(r)

    return () => {
      r && observer.unobserve(r)
    }
  }, [r, rootMargin])
  return isIntersecting
}

declare global{
  interface Navigator{
    msMaxTouchPoints: number
  }
}

function hasTouch() {
  if ( typeof window === 'undefined' || typeof navigator === 'undefined') return false
  return ( 'ontouchstart' in window ) ||
         ( navigator.maxTouchPoints > 0 ) ||
         ( navigator.msMaxTouchPoints > 0 )
}