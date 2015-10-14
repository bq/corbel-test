describe('In IAM module', function() {
    var corbelRootDriver;

    before(function() {
        corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
    });

    describe('while testing devices', function() {
        var userId;
        var corbelDriver;
        var random;
        var user = {
            'firstName': 'userGet',
            'email': 'user.get.',
            'username': 'user.get.',
            'password': 'pass'
        };
        var emailDomain = '@funkifake.com';
        var device = {
            notificationUri: '123',
            uid: '123',
            name: 'device',
            type: 'Android',
            notificationEnabled: true
        };  

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
            random = Date.now();

            corbelDriver.iam.users()
            .create({
                'firstName': user.firstName + random,
                'email': user.email + random + emailDomain,
                'username': user.username + random,
                'password': user.password
            })
            .should.be.eventually.fulfilled
            .then(function(id) {
                userId = id;

                return corbelTest.common.clients.loginUser
                (corbelDriver, user.username + random + emailDomain, user.password)
                .should.eventually.be.fulfilled;
            })
            .should.notify(done);
        });

        afterEach(function(done) {
            corbelRootDriver.iam.user(userId)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelRootDriver.iam.user(userId)
                .get()
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('an admin can register devices and complete CRUD operations', function(done) {
            var retriveDevice;

            corbelDriver.iam.user(userId)
            .registerDevice(device)
            .should.eventually.be.fulfilled
            .then(function() {
                return corbelDriver.iam.user(userId)
                .getDevices()
                .should.eventually.be.fulfilled;
            })
            .then(function(responseDevice) {
                retriveDevice = responseDevice.data[0];
                ['notificationUri', 'uid', 'name', 'type', 'notificationEnabled'].forEach(function(key) {
                    expect(retriveDevice[key]).to.be.equals(device[key]);
                });
                expect(retriveDevice.userId).to.be.equals(userId);
                device.name = 'My black device';

                return corbelDriver.iam.user(userId)
                .registerDevice(device)
                .should.eventually.be.fulfilled;
            })
            .then(function(deviceId) {
                expect(deviceId).to.be.equals(retriveDevice.id);
                retriveDevice.name = device.name;

                return corbelDriver.iam.user(userId)
                .getDevice(deviceId)
                .should.eventually.be.fulfilled;
            })
            .then(function(responseDevice) {
                return corbelDriver.iam.user(userId)
                .deleteDevice(responseDevice.data.id)
                .should.eventually.be.fulfilled;
            })
            .then(function() {
                return corbelDriver.iam.user(userId)
                .getDevices()
                .should.eventually.be.fulfilled;
            })
            .then(function(devices) {
                expect(devices).to.have.deep.property('data.length', 0);
            })
            .should.notify(done);
        });

        it('users can register his devices and complete CRUD operations', function(done) {
            var retriveDevice;

            corbelDriver.iam.user()
            .getMyDevices()
            .should.eventually.be.fulfilled
            .then(function(devices) {
                expect(devices).to.have.deep.property('data.length', 0);

                return corbelDriver.iam.user()
                .registerMyDevice(device)
                .should.eventually.be.fulfilled;
            })
            .then(function(deviceId) {
                return corbelDriver.iam.user()
                .getMyDevice(deviceId)
                .should.eventually.be.fulfilled;
            })
            .then(function(responseDevice) {
                retriveDevice = responseDevice.data;
                ['notificationUri', 'uid', 'name', 'type', 'notificationEnabled'].forEach(function(key) {
                    expect(retriveDevice[key]).to.be.equals(device[key]);
                });
                expect(retriveDevice.userId).to.be.equals(userId);
                device.name = 'My black device';

                return corbelDriver.iam.user()
                .registerMyDevice(device)
                .should.eventually.be.fulfilled;
            })
            .then(function(deviceId) {
                expect(deviceId).to.be.equals(retriveDevice.id);
                retriveDevice.name = device.name;

                return corbelDriver.iam.user()
                .getMyDevices()
                .should.eventually.be.fulfilled;
            })
            .then(function(responseDevices) {
                var auxResponseDevices = responseDevices.data || undefined;
                expect(auxResponseDevices[0]).to.deep.equal(retriveDevice);

                return corbelDriver.iam.user()
                .deleteMyDevice(auxResponseDevices[0].id)
                .should.eventually.be.fulfilled;
            })
            .then(function() {
                return corbelDriver.iam.user()
                .getMyDevices()
                .should.eventually.be.fulfilled;
            })
            .then(function(devices) {
                expect(devices).to.have.deep.property('data.length', 0);
            })
            .should.notify(done);
        });

        it('users can register his devices using user(me) and complete CRUD operations', function(done) {
            var retriveDevice;

            corbelDriver.iam.user('me')
            .getDevices()
            .should.eventually.be.fulfilled
            .then(function(devices) {
                expect(devices).to.have.deep.property('data.length', 0);

                return corbelDriver.iam.user('me')
                .registerDevice(device)
                .should.eventually.be.fulfilled;
            })
            .then(function(deviceId) {
                return corbelDriver.iam.user('me')
                .getDevice(deviceId)
                .should.eventually.be.fulfilled;
            })
            .then(function(responseDevice) {
                retriveDevice = responseDevice.data;
                ['notificationUri', 'uid', 'name', 'type', 'notificationEnabled'].forEach(function(key) {
                    expect(retriveDevice[key]).to.be.equals(device[key]);
                });
                expect(retriveDevice.userId).to.be.equals(userId);
                device.name = 'My black device';

                return corbelDriver.iam.user('me')
                .registerDevice(device)
                .should.eventually.be.fulfilled;
            })
            .then(function(deviceId) {
                expect(deviceId).to.be.equals(retriveDevice.id);
                retriveDevice.name = device.name;

                return corbelDriver.iam.user('me')
                .getDevices()
                .should.eventually.be.fulfilled;
            })
            .then(function(responseDevices) {
                var auxResponseDevices = responseDevices.data || undefined;
                expect(auxResponseDevices[0]).to.deep.equal(retriveDevice);

                return corbelDriver.iam.user('me')
                .deleteDevice(auxResponseDevices[0].id)
                .should.eventually.be.fulfilled;
            })
            .then(function() {
                return corbelDriver.iam.user('me')
                .getDevices()
                .should.eventually.be.fulfilled;
            })
            .then(function(devices) {
                expect(devices).to.have.deep.property('data.length', 0);
            })
            .should.notify(done);
        });

        it('users can register his devices using user() and complete CRUD operations', function(done) {
            var retriveDevice;

            corbelDriver.iam.user()
            .getDevices()
            .should.eventually.be.fulfilled
            .then(function(devices) {
                expect(devices).to.have.deep.property('data.length', 0);

                return corbelDriver.iam.user()
                .registerDevice(device)
                .should.eventually.be.fulfilled;
            })
            .then(function(deviceId) {
                return corbelDriver.iam.user()
                .getDevice(deviceId)
                .should.eventually.be.fulfilled;
            })
            .then(function(responseDevice) {
                retriveDevice = responseDevice.data;
                ['notificationUri', 'uid', 'name', 'type', 'notificationEnabled'].forEach(function(key) {
                    expect(retriveDevice[key]).to.be.equals(device[key]);
                });
                expect(retriveDevice.userId).to.be.equals(userId);
                device.name = 'My black device';

                return corbelDriver.iam.user()
                .registerDevice(device)
                .should.eventually.be.fulfilled;
            })
            .then(function(deviceId) {
                expect(deviceId).to.be.equals(retriveDevice.id);
                retriveDevice.name = device.name;

                return corbelDriver.iam.user()
                .getDevices()
                .should.eventually.be.fulfilled;
            })
            .then(function(responseDevices) {
                var auxResponseDevices = responseDevices.data || undefined;
                expect(auxResponseDevices[0]).to.deep.equal(retriveDevice);

                return corbelDriver.iam.user()
                .deleteDevice(auxResponseDevices[0].id)
                .should.eventually.be.fulfilled;
            })
            .then(function() {
                return corbelDriver.iam.user()
                .getDevices()
                .should.eventually.be.fulfilled;
            })
            .then(function(devices) {
                expect(devices).to.have.deep.property('data.length', 0);
            })
            .should.notify(done);
        });
    });
});