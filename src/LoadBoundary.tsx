import { Component, type ReactNode } from 'react';
import { L, text, type Lang } from './i18n';
import './load-failure.css';

interface Props { children: ReactNode; lang?: Lang; scope?: 'app' | 'page' }

function language(): Lang {
  try {
    const value = JSON.parse(localStorage.getItem('izqor.language') || '"ru"');
    return ['ru', 'kk', 'en'].includes(value) ? value : 'ru';
  } catch { return 'ru'; }
}

export default class LoadBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  render() {
    if (!this.state.failed) return this.props.children;
    const lang = this.props.lang || language();
    return <section className="load-failure" data-scope={this.props.scope || 'app'} role="alert">
      <h2>{text(this.props.scope === 'page'
        ? L('Не удалось открыть раздел', 'Бөлім ашылмады', 'This section could not load')
        : L('Не удалось загрузить приложение', 'Қолданба жүктелмеді', 'The application could not load'), lang)}</h2>
      <p>{text(L('Обновите страницу и попробуйте ещё раз.', 'Бетті жаңартып, қайталап көріңіз.', 'Refresh the page and try again.'), lang)}</p>
      <div className="load-failure-actions">
        <button type="button" className="button button-gold" onClick={() => window.location.reload()}>{text(L('Обновить страницу', 'Бетті жаңарту', 'Refresh page'), lang)}</button>
        {this.props.scope === 'page' && <a href="#/">{text(L('К путешествию', 'Саяхатқа оралу', 'Back to the journey'), lang)}</a>}
      </div>
    </section>;
  }
}
