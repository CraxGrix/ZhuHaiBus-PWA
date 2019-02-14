import axios from 'axios'
const prefix = 'https://api.clive.site'
axios.defaults.timeout = 3000
function _RequestData(urlPath) {
	return axios.get(urlPath)
}
export const requestRealTimeData = ({ Id,  LineNumber, FromStation }) => _RequestData(`${prefix}/realtime/${Id}&${encodeURI(LineNumber)}&${encodeURI(FromStation)}`)
