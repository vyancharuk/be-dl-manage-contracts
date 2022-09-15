const addHeaders = async (request, profileId) => {
    request
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');

    if (profileId) {
        request.set('profile_id', profileId);
    }

    return request;
};

module.exports = { addHeaders };
