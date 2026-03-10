import axios from 'axios';
import store from '../store/store';

function retrieveAllPatientIds() {
  return new Promise((resolve, reject) => {
    const { accessToken } = store.getState().fhirServerState;
    const fhirServer = store.getState().fhirServerState.currentFhirServer;
    const headers = {
      Accept: 'application/json+fhir',
    };
    const patientInfoList = [];

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken.access_token}`;
    }

    axios({
      method: 'get',
      url: `${fhirServer}/Patient`,
      headers,
    }).then((result) => {
      if (result.data && result.data.resourceType === 'Bundle'
        && Array.isArray(result.data.entry) && result.data.entry.length) {
        result.data.entry.forEach((patient) => {
          const patientInfo = { id: '', name: 'Unknown', dob: '' };
          patientInfo.id = patient.resource.id;
          if (Array.isArray(patient.resource.name)) {
            const nameObj = patient.resource.name[0];
            let given = '';
            let family = '';
            if (Array.isArray(nameObj.given) && nameObj.given.length > 0) {
              given = nameObj.given.join(' ');
            }
            if (typeof nameObj.family === 'string') {
              family = nameObj.family;
            } else if (Array.isArray(nameObj.family)) {
              family = nameObj.family.join(' ');
            }
            const fullName = [given, family].filter(Boolean).join(' ');
            patientInfo.name = fullName || 'Unknown';
          }
          patientInfo.dob = patient.resource.birthDate;
          patientInfoList.push(patientInfo);
        });
        return resolve(patientInfoList);
      }
      return reject();
    }).catch((err) => {
      console.error('Could not retrieve patients from current FHIR server', err);
      return reject(err);
    });
  });
}

export default retrieveAllPatientIds;
