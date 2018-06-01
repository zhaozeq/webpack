function component() {
    var element = document.createElement('div');

    // Lodash, now imported by this script
    element.innerHTML = '黑体文字';
    return element;
}
document.getElementById('root').appendChild(component());
