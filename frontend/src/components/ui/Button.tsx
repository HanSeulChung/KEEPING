'use client'

import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export const Button = ({ className = '', ...props }: ButtonProps) => {
  return <button className={className} {...props} />
}

export default Button


