import React, { type EffectCallback } from 'react'

const useOnMount = (fn: EffectCallback) => {
  React.useEffect(fn,[])
}

export default useOnMount