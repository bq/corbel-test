describe('In IAM module', function() {

    var corbelDriver;
    var userId;
    var corbelDriverAdmin;

    before(function() {
        corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        corbelDriverAdmin = corbelTest.drivers['ADMIN_CLIENT'].clone();
    });


    after(function(done) {
        corbelDriverAdmin.iam.user(userId)
            .delete()
            .should.notify(done);
    });

    it('when request to create a new user and login with basic ' +
        'and specific device id successes returning user',
        function(done) {
            var deviceId = '123';

            var random = Date.now();

            var userCreate = {
                'firstName': 'createUserIam',
                'email': 'createUserIam.iam.',
                'username': 'createUserIam.iam.',
            };
            var domainEmail = '@funkifake.com';
            var user = {
                'firstName': userCreate.firstName,
                'email': userCreate.email + random + domainEmail,
                'username': userCreate.username + random + domainEmail,
                'password': 'myPassword'
            };

            var tokenValidation = /^.+\..+\..+$/;


            corbelDriverAdmin.iam
                .users()
                .create(user)
                .then(function(id) {
                    userId = id;
                    return corbelTest.common.clients.loginUser(corbelDriver, user.email, user.password,
                            deviceId);
                })
                .then(function(response) {
                    var accessToken = response.data.accessToken;
                    expect(response.data.accessToken).to.match(tokenValidation);
                    var tokenContent = JSON.parse(window.atob(accessToken.split('.')[0]));
                    expect(tokenContent.deviceId).to.be.equal(deviceId);
                    return corbelDriver.iam.user('me')
                        .getDevice(deviceId)
                        .should.be.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 404);
                    expect(e).to.have.deep.property('data.error', 'not_found');
                })
                .should.notify(done);
        });
});
