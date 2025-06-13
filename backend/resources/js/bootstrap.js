import _ from 'lodash';
window._ = _;

import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Configuração básica do Cornerstone (sem WADO por enquanto)
import cornerstone from 'cornerstone-core';

// Exportar para uso global
window.cornerstone = cornerstone;

