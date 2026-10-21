import React from 'react'
import { LegalPage } from './legal/LegalPage'
import { privacyPolicy, termsOfUse } from './legal/content'

export function PrivacyPolicy() {
  return <LegalPage doc={privacyPolicy} />
}

export function TermsOfUse() {
  return <LegalPage doc={termsOfUse} />
}
