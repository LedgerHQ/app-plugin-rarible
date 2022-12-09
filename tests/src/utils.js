const pluginFolder = "rarible";

function getPluginConfigBasePath(folderName, network="ethereum"){
    return `${pluginFolder}/${network}/${folderName}`;
}

module.exports = {
    getPluginConfigBasePath
}