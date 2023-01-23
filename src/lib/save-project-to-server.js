import queryString from 'query-string';
import xhr from 'xhr';
import storage from '../lib/storage';

/**
 * Save a project JSON to the project server.
 * This should eventually live in scratch-www.
 * @param {number} projectId the ID of the project, null if a new project.
 * @param {object} vmState the JSON project representation.
 * @param {object} params the request params.
 * @property {?number} params.originalId the original project ID if a copy/remix.
 * @property {?boolean} params.isCopy a flag indicating if this save is creating a copy.
 * @property {?boolean} params.isRemix a flag indicating if this save is creating a remix.
 * @property {?string} params.title the title of the project.
 * @property {?token} params.token the token for authorization
 * @return {Promise} A promise that resolves when the network request resolves.
 */
export default function (projectId, vmState, params) {
    const body = {
        game: {
            data: JSON.parse(vmState)
        },
    }
    // This is the layer for converting
    // scratch projects to cambrian games
    // Title to name is here.
    if (params.hasOwnProperty('title')) {
        body["game"]["name"] = params.title;
    }
    const creatingProject = projectId === null || typeof projectId === 'undefined';
    const queryParams = {};
    if (params.hasOwnProperty('originalId')) queryParams.original_id = params.originalId;
    if (params.hasOwnProperty('isCopy')) queryParams.is_copy = params.isCopy;
    if (params.hasOwnProperty('isRemix')) queryParams.is_remix = params.isRemix;
    let qs = queryString.stringify(queryParams);
    if (qs) qs = `?${qs}`;

    const opts = {
        body: JSON.stringify(body),
        // If we set json:true then the body is double-stringified, so don't
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${params.token}`
        },
        withCredentials: true
    };

    if (creatingProject) {
        Object.assign(opts, {
            method: 'post',
            url: `${storage.projectHost}/${qs}`
        });
    } else {
        Object.assign(opts, {
            method: 'put',
            url: `${storage.projectHost}/${projectId}${qs}`
        });
    }
    return new Promise((resolve, reject) => {
        xhr(opts, (err, response) => {
            if (err) return reject(err);
            if (response.statusCode !== 200) return reject(response.statusCode);
            try {
                // Since we didn't set json: true, we have to parse manually
                let game = JSON.parse(response.body);

                // Convert game mae to scratch project title
                // This happens here as a layer for conversion of things
                if(game.name) {
                    game.title = game.name
                    // no more name after here. Scratch uses title
                    delete game["name"]
                }
                resolve(game);
            } catch (e) {
                return reject(e);
            }

        });
    });
}
