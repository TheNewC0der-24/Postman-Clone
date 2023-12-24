console.log('Welcome to Postman Clone');

const queryParamsContainer = document.querySelector('[data-query-params]');
const requestHeadersContainer = document.querySelector('[data-request-headers]');
const keyValueTemplate = document.querySelector('[data-key-value-template]');
const form = document.querySelector('[data-form]');
const responseHeadersContainer = document.querySelector('[data-response-headers]');

document.querySelector('[data-add-query-param-btn]').addEventListener('click', () => {
    queryParamsContainer.append(createKeyValuePair());
});

document.querySelector('[data-request-header-btn]').addEventListener('click', () => {
    requestHeadersContainer.append(createKeyValuePair());
});

queryParamsContainer.append(createKeyValuePair());
requestHeadersContainer.append(createKeyValuePair());

axios.interceptors.request.use(request => {
    request.customData = request.customData || {};
    request.customData.startTime = new Date().getTime();
    return request;
})

function updateEndTime(response) {
    response.customData = response.customData || {};
    response.customData.time = new Date().getTime() - response.config.customData.startTime;
    return response;
}

axios.interceptors.response.use(updateEndTime, e => {
    return Promise.reject(updateEndTime(e.response));
});

var editor = ace.edit("json-input");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/json");
editor.session.setUseWrapMode(true);
editor.setOptions({
    autoScrollEditorIntoView: true,
    copyWithEmptySelection: true,
});
editor.session.setUseSoftTabs(true);
editor.session.mergeUndoDeltas = true;
editor.setValue('{}', -1);

var outputEditor = ace.edit("json-output");
outputEditor.setTheme("ace/theme/monokai");
outputEditor.session.setMode("ace/mode/json");
outputEditor.setReadOnly(true);
outputEditor.session.setUseWrapMode(true);

form.addEventListener('submit', (e) => {
    e.preventDefault();

    let data;
    try {
        // data = JSON.parse(document.querySelector('[data-json-request-body] textarea').value || null);
        data = JSON.parse(editor.getValue()) || null;
    }
    catch (e) {
        document.querySelector('[data-alert]').classList.remove('d-none');
        setTimeout(() => {
            document.querySelector('[data-alert]').classList.add('d-none');
        }, 3000);
        return;
    }

    axios({
        url: document.querySelector('[data-url]').value,
        method: document.querySelector('[data-method]').value,
        params: keyValuePairsToObjects(queryParamsContainer),
        headers: keyValuePairsToObjects(requestHeadersContainer),
        data,
    })
        .catch(e => e)
        .then((response) => {
            document.querySelector('[data-response-section]').classList.remove('d-none');
            updateResponseDetails(response);
            outputEditor.setValue(JSON.stringify(response.data, null, 2), -1);
            // document.querySelector('[data-json-response-body]').innerHTML = '<pre>' + '<code>' + JSON.stringify(response.data, null, 2) + '</code>' + '</pre>';
            updateResponseHeaders(response.headers);
        });
});

function createKeyValuePair() {
    const element = keyValueTemplate.content.cloneNode(true);
    element.querySelector('[data-remove-btn]').addEventListener('click', (e) => {
        e.target.closest('[data-key-value-pair]').remove();
    });
    return element;
};

function keyValuePairsToObjects(container) {
    const pairs = container.querySelectorAll('[data-key-value-pair]');
    return [...pairs].reduce((data, pair) => {
        const key = pair.querySelector('[data-key]').value;
        const value = pair.querySelector('[data-value]').value;

        if (key === '') return data;
        return { ...data, [key]: value };
    }, {});
};

function formatSize(size) {
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
};

function updateResponseDetails(response) {
    document.querySelector('[data-status]').textContent = response.status;
    document.querySelector('[data-time]').textContent = response.customData.time;
    const sizeInBytes = JSON.stringify(response.data).length + JSON.stringify(response.headers).length;
    document.querySelector('[data-size]').textContent = formatSize(sizeInBytes);
};

function updateResponseHeaders(headers) {
    responseHeadersContainer.innerHTML = '';
    Object.entries(headers).forEach(([key, value]) => {
        const keyElement = document.createElement('div');
        keyElement.classList.add('fw-bold');
        keyElement.textContent = key + ':';
        responseHeadersContainer.append(keyElement);

        const valueElement = document.createElement('div');
        valueElement.textContent = value;
        responseHeadersContainer.append(valueElement);
    });
};

window.addEventListener('load', () => {
    const loader = document.getElementById("loader");

    setTimeout(() => {
        loader.style.display = "none";
    }, 5000);
});