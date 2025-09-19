'use client'

import { useState } from 'react'

interface UserRegistrationData {
  name: string
  businessNumber: string
  paymentPassword: string
  phoneNumber: string
  birthDate: string
  gender: 'male' | 'female' | ''
  profileImage?: File
}

export default function UserRegistration() {
  const [formData, setFormData] = useState<UserRegistrationData>({
    name: '',
    businessNumber: '',
    paymentPassword: '',
    phoneNumber: '',
    birthDate: '',
    gender: '',
  })

  const [isPhoneVerified, setIsPhoneVerified] = useState(false)

  const handleInputChange = (field: keyof UserRegistrationData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGenderSelect = (gender: 'male' | 'female') => {
    setFormData(prev => ({
      ...prev,
      gender
    }))
  }

  const handlePhoneVerification = () => {
    // 전화번호 인증 로직
    console.log('전화번호 인증:', formData.phoneNumber)
    setIsPhoneVerified(true)
  }

  const handleImageUpload = () => {
    // 이미지 업로드 로직
    console.log('이미지 업로드')
  }

  const handleSubmit = () => {
    // 가입하기 로직
    console.log('회원가입 데이터:', formData)
  }

  return (
    <div className="w-[1444px] h-[852px] relative">
      <p className="w-[355px] h-7 absolute left-[544px] top-[57px] text-4xl font-bold text-center text-black">
        사용자 등록
      </p>
      
      <div className="w-[385px] h-[656px] absolute left-[529px] top-[136px]">
        {/* 프로필 이미지 업로드 섹션 */}
        <div className="flex flex-col justify-start items-center w-[107px] absolute left-[138px] top-0 gap-3">
          <svg
            width={97}
            height={96}
            viewBox="0 0 97 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            className="flex-grow-0 flex-shrink-0 w-24 h-24"
            preserveAspectRatio="none"
          >
            <g clipPath="url(#clip0_344_994)">
              <path
                d="M0.5 48C0.5 21.4903 21.9903 0 48.5 0C75.0097 0 96.5 21.4903 96.5 48C96.5 74.5097 75.0097 96 48.5 96C21.9903 96 0.5 74.5097 0.5 48Z"
                fill="url(#pattern0_344_994)"
              />
            </g>
            <path
              d="M48.5 0.5C74.7335 0.5 96 21.7665 96 48C96 74.2335 74.7335 95.5 48.5 95.5C22.2665 95.5 1 74.2335 1 48C1 21.7665 22.2665 0.5 48.5 0.5Z"
              stroke="black"
            />
            <defs>
              <pattern
                id="pattern0_344_994"
                patternContentUnits="objectBoundingBox"
                width={1}
                height={1}
              >
                <use xlinkHref="#image0_344_994" transform="translate(0.204545) scale(0.00454545)" />
              </pattern>
              <clipPath id="clip0_344_994">
                <path
                  d="M0.5 48C0.5 21.4903 21.9903 0 48.5 0C75.0097 0 96.5 21.4903 96.5 48C96.5 74.5097 75.0097 96 48.5 96C21.9903 96 0.5 74.5097 0.5 48Z"
                  fill="white"
                />
              </clipPath>
              <image
                id="image0_344_994"
                width={130}
                height={220}
                preserveAspectRatio="none"
                xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIIAAADcCAYAAAC8h3l6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAGiPSURBVHgB7b0HoG1XVS78zbX76e2e22uSm3YTSEV6aPKLiBQJgtjpKqI8FCzPoE8sPPAhWFEQFPERWgBBJSEBQgLpvd2W28vp/ey25j9mGXOOtc/NzSU5OwTfmcm5e+9V5ppljG/UORewUlbKSlkpK2WlrJSVslJWykpZKStlpayUlbJSVspKWSkrZaWslJWyUlbKSlkpK2WlrJSVslJWykpZKStlpayUlbJSVspKWSkrZaWslJWyUlbKSlkpK2WlrJSVslKe0KK1Vo/1/KPd+9+l/L/QSfUL77is9xdf/4aNqyv1szr61Ybhoa7Nzer4WR26tnZi/97NxUpJpfXmdL6j43ixa9VMrvu86/Yd2n1g9GjzwL7x9L67bzp09Iorrmjgv3H570QIpi/afJmt7j5PNe58WYc68CrM3Hc68vVuHD9OV3QAaR5IykC+RN9zdEz725t0t69C14DGIl1Dn6gDa09voNpzCAMXXHtgrPPjG1c9/xal1Hzrc3+Yyw8zISiCbdCE6Cu0Tn558uvP3lDY9W5M3vJsjD7cicpmINepoVNlu6lSN1mM9HQr3Qw3h9odT+hPp+67JZCEp5n+o5PpNB2aJDqhm899xV1jx9d+4Kbp9P++5IyXVN3FXNkPX/lhJIRAAPtHblu3rn/n+3IHPvdqzC12oLSeTuQUdNNegBR+Qs0E06eZeJ4mM22GNlTiD6TuoDlGQBGnk4mEj1kC0ZaQCuOWcPSWV31jsr7j1wdK59yDH1KC+KEhBDP3lo2JAA6Mf/28Df3H/gn3ffJCFDZr5IoaTeJ8xTPmJ54nO0kEp4caYS8I1yGigP0BV485xtOq/J+9ltGkoJGSGMkdUrO14Z1dZ//hzyq18XuIT/qhIIgfCkJ49atfnbvyyiubD+77+rbtG3Z/Gfd//hxdOkM7/k49S6v4YTkdfq79ZIfZZATwCGEuTFMvFuSccQXys/WczvzUqqBVbadC/9l7seZXXqPUaTcjS1lP2pLgSVxIBBiQRv8L+5NUf/Fr2xc+tFvvvetslM5IHe6nSYYA4LlXyUnTQjxI1DbXeFFgiCDlSvgvNAJxphkdzD9pvI7pQVcV8tu0nm1swZ1vvEmPv+8u6sOQrymHJ3F50hKCQQESA83Jmute/XevrSzo+656MYmBplPyLQEInFctsI9IEHbyPAEE6PdzkjYdEWQ4XHI6E0Aafyf8HBWJJLgaTLM0XVVX6DxbY/zQufrO5x2bmPjUFbBmyZOXGJ50ooEdOEYXaKQf/Xpu11UvTJNtzSSt5pxiJ2G6RQyzts+qQqqFLPf3molser2ARUEgGgj04BalWYTJII5AiiQ2IyimRi1JSg2FY3n0r9/53m907bji8ivq2UY/OcqTjRDs9N00dtPGS5ofvR+TaQdUiTREYmnp4Gu13HlC7d3WVHTWAE+szswSWiE9q0CqWGciEEXploczwWmhPMr6ou6hTUl1mqxayKH/A5cqNWR0B4MOTTxJypNJNJiBSScXr/nRS2fet19PV8pEBLBiIJhtYgKYU7WX1cE01K4qhvNwm4B8LkpH3cIdiDdwfZY2mlndQAslMZXXekIyBJDG80ZaJInK6dHBBh54/U333P77b4IjgjyeJOVJQQiXXWYHpFld+Ozre3f98X+iuaWhdM0Qhsqyv5TnzOW52IugNghFznwmwhxk76HDbXc4o18kWR+C8kql/UjEtayXCP0j8XWb6+w8S51CmL6LeeS3184d2vt3M3ve80d0sIEnid7wZBANFiKb+vP/I7n/4+/Xhc0kU40fuNXcM0VOokcBtvPhfQX2Eg/ZUmYzamQcAjpyNaReIUWEyooFreMzGE2C3qDj85T3SmnvqFKIuoPO13T9cLE2cO4Hy2vf+044ZPiBxjJ+oIhAgRzLOnOHP/wWdf/H3q+L24gImnlI959uCi4XxBEmQaAA+wWMjpD673bwW30HqfsLcA4BNB4B+KDiyVNZMWKJRoilUInyiODbq7x+wcRkibVWRH51rTT70G/O7v2ND8IRwQ9UTPzACMEQAf2li4tX/XjH6Jf/RhW2GnHgB8MPLJt70paH5FAgcGT4aSYgF62ChP1Nvk4rJRLB2Ygihf0EmTpV1C/std5zaRk9EdcKHSb1BApkLIhAqPR8sozJHTpQLy8c+I2m/vQf4gcsJn6QokEdmrj5qeuOvec2XdjRVMY8zJiGSVTOlI8S8kSFVqsWhc1PvEERq+l7WLao4l0PaQsBmMJEkYF+eEeTOGcL6x+CSIO1wu0SlBl8GbHJ4Ro6p9N8TZWOF8e6f/JXhgZe99fAEpvoCSk/EEQwaHDt3r2ldQt/TkRwbkoeOccJWo6Bh1OG1qDBt1gIkggsUbBM9p9geX0iItBZIgiig9HDTzLkZKr4J/WFzNypWH+aPSxRwVoUqlFMa8P1wfnP/ZXWB87DD6j8IBDBKod69Lfv1ePTZykTKFJ2ULJhYYiooE5ES6VFACzh4synaiEITwzAUlQJ4qc1OIWl+mC4XiiB5r4kF/UOqRwGxdP7NzLw0LT1aJQbau2Ueu//3lS+9957tYmt4AksTzQh2OE5evgj7xme+ub7VGHY5QsobwamaRaGtRcL5jN4AhMBnmLyeJITJcZZKJOMHPa6NKJKRk9g5PHfM1TFBJUKXYHbyHUJuRXEkKgXos0ZInWHmo26rm04/c6Ort++AE9wsOoJFw0PTH5z6+rpLxIRrG+GpBEbR/QRQFt01PblQGtBIBklDXFytIoTmwo/gfQYssIXlE9fQYoscZiStiAUm63upNdJ4AlQ8JX2oo3rCIQgiEYnmf7mcgVd3nfDU+dnv/g6PMERyycSEZxI2P0zIxqrBlS6qOLMs5z2E29b1irTgaX+AL43yUKyP+xQRAlIFmJCFkYNCd2MCuFRLc/k34EwvMgKyCCImM1PRhNuV0bzdd9T5JvJuoXcrff/ROfFF7/MZD49ISLiiUSE5uieD/4RGmqILAQVMJxluZ3IltBusN89R4dBFSJEM1y3EAGbbDy5weRsZTQRyJLymx1SjBI8iazowfc75DFwG/Une0J1xsiIBCN9QhKmVO0OtXPr312wvWvHHcu5GcbJStsIwXTgGNBxzwMz5XzP2JXPnX3187R6DvVq0SW1MhHwwIXFJdKdCwQfPUfvUqGY2clXQR9tjUgaX4BK7sD16Z+PzibnvD1Jm39Hx7tT7V4Sxq/5074um6KotE8zSDGZdjVfmfsJ+noWTX0VGcvByHGzsUVQDnVWd9BC0WQCYAIO/RZTYGMzZn+lndhd/sXDh3Kv+svOkl7sWlW48kwyZ9uVxs7l8RBCZutXmvi+vbOL5x+ZqL54w9reZ9949+iZlUKuj6KoJbNtbDndn74weaNK04tUklTh2RVZryPioEo7LPPuBiCTOSyXw3EOAk1QMy2SO/ke3NP8JezKveaaSnOaIEkNwL0TxNattVJLRsNypaYqnD4yQ2bnqwqvoKovJjqsWXUnXog42XxMSUsoRSaFPYgKILNlDszb5HNE3w9jf/IC/e3ar6sBNY5GU9GfRiPVjXKltPMpp3Xd0gNcc2wW3zqzFwc9cQg8eRyTicdW7OaH3x0b6xnsHPiT49PNnzl4aKK3XMqjVKAOeSUu1TpYgnVdwiJm8NLcG1FMO2k8huhcQ0C+n82Qy+Cbl/HTC7MrGuvIipc8/btI47sH326+DyO5i9MePZ00HQHZtNpohGiPC+4zW7TPwc1jmkzUHy++DR3JIjVvA93biG3JJMdqZKOKQNZaYvEX+6x9YErlb8Nt+rexu/ly9BERpNq9p1IL2jc/zO4ADUdcemCwdN/Zg/nfHcrnr0Imw/b7L48ZEY5q/cvX3z3xD93mDerKmwn2jBlt5VE6I7gtl403u3F+7p9xdvLPREqDdNTsl9x00KgE5CsZiQNkICokr3gfvXv9r9nJdZwGdBKHiHtvTN+NbgvzVSjIvAX/LsZQHesbOiOuWXy7lfcax5q9ODt3Dc7NfQqV9DgRxDBd00ssUXMBrbBZN7eVibdlmyCmC00u7GSW2rsfx+oX4bv6HTAZkx3ELGaj8pRFV2ayXL2WcP1gz9dS1dVVnHzhpo6zicKP4YkkBJrg3n+96cjkqoEuyzeeEZTyUOeWA+ggs+2AGsS2u6k1sdjsIp7VOF19DWckX0VXYnYY66AjZt+hkp93drPKHAbfZB4FchIpGjgk81hQw9jVeD4ezr2c4LSTiGCCiDOPR0D/zDdmVOmzCmTI+kuzRi3vwETagbXJA9iAG7E29z104YjVK5Cat9Ob91HQn9lLUQkxYJHPTKNpL0U1aZrnsQr70mfiIbwMNdWPQTVpRACMD0SHnecc4jkVQ0cJg0ww3ALHtg093z29op6Bx1geMyJ8d0r/bL3W/OTs2DRyhZxOHaIr3iCOMVhL2R986cq+Sq+mK5hKS+hUxzGk9mBY30OwuB/l3JhblpguIJevWaJq6jJNbAdV4bhlkcTLZGEjRuvn4Lh+KhFCN3pIZOax4NMAGPQln5siRErAXdHGR+InO9nuDfYm5bSKMuZIDympWfQSMfTk9qErHUFFjdCZGRRSEk9JHk3Tz2YHXd+HRdWDsfRcjOU2YaHRh+6kgVIyZ98oH9HCiSn3LtmWNmekoMVdIjGtNq7tnt/YlTyrX6nHvHfCYyKEz3zmM7nLL7+8+T/e/8nO5770+X+ok77Xrx8uDc+Z1xJMz9Lk5YigtZJSXfnH6SDG/BFvi6d0ZY0mu9os2Ik2SJAoM+1uQBrGX++dNWaiizSJ+VwDFZNAkqQ+ymu0eBXkqXsKP9M90qBWap+m4io7BcSrvTyWip0vAuR8TMxQftNaDnVVtscb1P5mLrFIZCRX3j0CZXNdjp5LCieFkpBqP9lsrQChnVF/tvtKmJ4oOWG5Qh79A0WdT5o7Fien3v21f/ybq8zL3H9gL+6QNu6r3/auNa97/Ruf94ynnfGj+8cXXljVyep6TRUaDeLm2qJFB1YbPNXb4U+dTAkcx5NhQvFxy4PETWfqliJ6wRAUyqA2t5hvdtlBUFg1Mj4H2Qr7DBWPaZ6SyIkhj1W6wv3vxJugTrSYF3oaJdPrDUiEBek25QqKqFjbqGN3tLdq7fbPhrjJx6Fn56vVtcOde3pV4+obbr3v33c9sP/6K978snn8gK2GRy1EmcnA6eetG1qzccf28868JElyfXsOL1yw5fShs5JqOnzg2FxO1+vGgWMHLvEqnSOPOPhhWpUSk+P0JjeYrC8gRrH9P8qztxZaAXebFS7J9IwGWZ+WI4FYg8+GDt+8CIRfJqmYuCHNhUAk5v/UK7nNZuos4lwOG9d16XxR1abm00NFpA800vp923or99370LGbb9r5vX2/9bKXzSlnu8pyMmH2fZW2EcLJyhVXfKb4M7/2gvLpAwMD/7FvZu2PbO5edeD41FmLOre+mSd6SDs69x863t3R19+ZpOnAYrUxSErIQG9PR29Xh8pNTDbQrFeDc8kQRI5fBENdKuQTmAX6DVJccknSqKcqIYGTqGIOjbp3B4sJz+cLBOlNEjXOxW0UWvNaKrqADqd5+7Z4g0o0eY1G3d5jUynCDi+OGPKlIlatqdAzUD1+fH6OdIRjdLjar9UXi2VVfeqWzpHR+fpYdwEPJKpw90Aex0bIVbHvjoenPvA3f1KbfeihmnntMn4A5QdCCI+1fPCGGyrVO/aWt5y+ubLprB2Vvv7e8uzMfCWfqHxSrOTO6ncLz7+1a3RhfGF2/jnnbZklHX3KvDf+rtH53unds0PbzxzcOtiXG9DuJTvHysDCN7+3Kzn/7PW49a5D5e7OJJ+ia6SzJz9e7BmY2LoK3Xc/dHw40Ulhamy08KJLzyo18vbVIyCD1ezNad7s0JyoYfxb1946fsN1X19sju+d/fu///u2egL/W5WlK5FXykp5DGWFiFbKSlkpK2WlrJSVslJWykpZKSvliSr/P595L7KRjVIYAAAAAElFTkSuQmCC"
              />
            </defs>
          </svg>
          <button
            onClick={handleImageUpload}
            className="flex justify-center items-center self-stretch flex-grow-0 flex-shrink-0 h-[22px] relative gap-2.5 px-4 py-[9px] rounded-lg bg-white border border-black hover:bg-gray-50 transition-colors"
          >
            <p className="self-stretch flex-grow w-[75px] h-1 text-[11px] font-bold text-center text-black">
              이미지 업로드
            </p>
          </button>
        </div>

        {/* 폼 필드들 */}
        <div className="flex flex-col justify-between items-start w-[385px] h-[502px] absolute left-0 top-[154px]">
          <div className="flex flex-col justify-start items-start self-stretch flex-grow gap-3">
            {/* 이름 필드 */}
            <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 w-28 h-[22px] relative gap-2.5 px-4 py-[9px] rounded-lg bg-white border border-black">
              <p className="self-stretch flex-grow w-20 h-1 text-[11px] font-bold text-center text-black">
                이름
              </p>
            </div>
            <input
              type="text"
              value={formData.businessNumber}
              onChange={(e) => handleInputChange('businessNumber', e.target.value)}
              placeholder="사업자 등록번호 ('-' 없이)"
              className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 h-[41.24px] relative p-2 rounded-md bg-white border border-gray-300 text-xs placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* 결제 비밀번호 필드 */}
          <div className="flex flex-col justify-start items-start self-stretch flex-grow gap-3">
            <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 w-28 h-[22px] relative gap-2.5 px-4 py-[9px] rounded-lg bg-white border border-black">
              <p className="self-stretch flex-grow w-20 h-1 text-[11px] font-bold text-center text-black">
                결제 비밀번호
              </p>
            </div>
            <input
              type="password"
              value={formData.paymentPassword}
              onChange={(e) => handleInputChange('paymentPassword', e.target.value)}
              placeholder="4자리 이상 6자리 이하 숫자를 입력해주세요."
              className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 h-[41.24px] relative p-2 rounded-md bg-white border border-gray-300 text-xs placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* 전화번호 필드 */}
          <div className="flex flex-col justify-start items-start self-stretch flex-grow gap-3">
            <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 w-28 h-[22px] relative gap-2.5 px-4 py-[9px] rounded-lg bg-white border border-black">
              <p className="self-stretch flex-grow w-20 h-1 text-[11px] font-bold text-center text-black">
                전화번호
              </p>
            </div>
            <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 h-[42px] relative pl-2 rounded-md bg-white border border-gray-300">
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="전화번호 ('-' 포함)"
                className="flex-grow text-xs placeholder-gray-400 bg-transparent focus:outline-none"
              />
              <button
                onClick={handlePhoneVerification}
                className="flex justify-center items-center flex-grow-0 flex-shrink-0 w-14 relative px-3 py-2.5 rounded-tr-md rounded-br-md bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <p className="flex-grow-0 flex-shrink-0 w-8 h-[21.25px] text-[13.600000381469727px] text-center text-white">
                  인증
                </p>
              </button>
            </div>
          </div>

          {/* 생년월일 필드 */}
          <div className="flex flex-col justify-start items-start self-stretch flex-grow gap-3">
            <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 w-28 h-[22px] relative gap-2.5 px-4 py-[9px] rounded-lg bg-white border border-black">
              <p className="flex-grow w-20 text-[11px] font-bold text-center text-black">생년월일</p>
            </div>
            <input
              type="text"
              value={formData.birthDate}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
              placeholder="YYYY-MM-DD ('-' 포함)"
              className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 h-[41.24px] relative p-2 rounded-md bg-white border border-gray-300 text-xs placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* 성별 선택 */}
          <div className="flex flex-col justify-start items-start self-stretch flex-grow gap-3">
            <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 w-28 h-[22px] relative gap-2.5 px-4 py-[9px] rounded-lg bg-white border border-black">
              <p className="flex-grow w-20 text-[11px] font-bold text-center text-black">성별</p>
            </div>
            <div className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 h-[41.24px] gap-2.5 rounded-md bg-white">
              <button
                onClick={() => handleGenderSelect('male')}
                className={`flex justify-start items-center self-stretch flex-grow relative rounded-md border ${
                  formData.gender === 'male' 
                    ? 'bg-blue-100 border-blue-500' 
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                } transition-colors`}
              >
                <p className="flex-grow w-[187.5px] text-xs text-center text-black">남성</p>
              </button>
              <button
                onClick={() => handleGenderSelect('female')}
                className={`flex justify-start items-center self-stretch flex-grow relative rounded-md border ${
                  formData.gender === 'female' 
                    ? 'bg-blue-100 border-blue-500' 
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                } transition-colors`}
              >
                <p className="flex-grow w-[187.5px] text-xs text-center text-black">여성</p>
              </button>
            </div>
          </div>

          {/* 가입하기 버튼 */}
          <button
            onClick={handleSubmit}
            className="flex justify-between items-center flex-grow-0 flex-shrink-0 w-[385px] relative px-3 py-2.5 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <p className="flex-grow-0 flex-shrink-0 text-[13.600000381469727px] text-center text-white w-full">
              가입하기
            </p>
          </button>
        </div>
      </div>
    </div>
  )
}
