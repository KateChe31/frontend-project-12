import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const NotFoundPage = () => {
  const { t } = useTranslation()

  return (
    <div className="container text-center mt-5">
      <h1>{t('notFound.title')}</h1>
      <p>
        {t('notFound.message')}
        {' '}
        <Link to="/" style={{ textDecoration: 'underline', color: 'inherit' }}>
          {t('notFound.back')}
        </Link>
      </p>
    </div>
  )
}

export default NotFoundPage
