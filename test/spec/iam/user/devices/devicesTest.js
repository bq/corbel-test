describe('In IAM module', function() {
    var corbelRootDriver;
    var deviceFields = ['notificationUri', 'uid', 'name', 'type', 'notificationEnabled'];

    before(function() {
        corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
    });

    describe('while testing devices', function() {
        var user;
        var corbelDriver;
        var random;
        var deviceId= '123';
        var device = {
            notificationUri: '123',
            name: 'device',
            type: 'ANDROID',
            notificationEnabled: true
        };

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['ROOT_CLIENT'].clone();

            corbelTest.common.iam.createUsers(corbelDriver, 1)
            .then(function(createdUsers) {
                user = createdUsers[0];

                return corbelTest.common.clients.loginUser(corbelDriver, user.username, user.password);
            })
            .should.notify(done);
        });

        afterEach(function(done) {
            corbelRootDriver.iam.user(user.id)
            .delete()
            .then(function() {
                return corbelRootDriver.iam.user(user.id)
                .get()
                .should.be.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('an admin can register devices and complete CRUD operations', function(done) {
            var retriveDevice;

            corbelDriver.iam.user(user.id)
            .registerDevice(deviceId, device)
            .then(function() {
                return corbelDriver.iam.user(user.id)
                .getDevices();
            })
            .then(function(responseDevice) {
                retriveDevice = responseDevice.data[0];
                ['notificationUri', 'uid', 'name', 'type', 'notificationEnabled'].forEach(function(key) {
                    expect(retriveDevice[key]).to.be.equals(device[key]);
                });
                device.name = 'My black device';

                return corbelDriver.iam.user(user.id)
                .registerDevice(deviceId, device);
            })
            .then(function() {
                retriveDevice.name = device.name;

                return corbelDriver.iam.user(user.id)
                .getDevice(deviceId);
            })
            .then(function(responseDevice) {
                return corbelDriver.iam.user(user.id)
                .deleteDevice(deviceId);
            })
            .then(function() {
                return corbelDriver.iam.user(user.id)
                .getDevices();
            })
            .then(function(devices) {
                expect(devices).to.have.deep.property('data.length', 0);
            })
            .should.notify(done);
        });

        it('users can register his devices using registerMyDevice and complete CRUD operations', function(done) {
            var retriveDevice;

            corbelDriver.iam.user()
            .getMyDevices()
            .then(function(devices) {
                expect(devices).to.have.deep.property('data.length', 0);

                return corbelDriver.iam.user()
                .registerMyDevice(deviceId, device);
            })
            .then(function(deviceId) {
                return corbelDriver.iam.user()
                .getMyDevice(deviceId);
            })
            .then(function(responseDevice) {
                retriveDevice = responseDevice.data;
                ['notificationUri', 'name', 'type', 'notificationEnabled']
                .forEach(function(key) {
                    expect(retriveDevice[key]).to.be.equals(device[key]);
                });
                device.name = 'My black device';

                return corbelDriver.iam.user()
                .registerMyDevice(deviceId, device);
            })
            .then(function(deviceId) {
                expect(deviceId).to.be.equals(retriveDevice.id);
                retriveDevice.name = device.name;

                return corbelDriver.iam.user()
                .getMyDevices();
            })
            .then(function(responseDevices) {
                var retriveDevice = responseDevices.data[0];
                    corbelTest.common.utils.expectFieldsToBeEquals(deviceFields, retriveDevice, device);

                    return corbelDriver.iam.user()
                        .deleteMyDevice(retriveDevice.id);
            })
            .then(function() {
                return corbelDriver.iam.user()
                .getMyDevices();
            })
            .then(function(devices) {
                expect(devices).to.have.deep.property('data.length', 0);
            })
            .should.notify(done);
        });

        it('users can register his devices using user and complete CRUD operations', function(done) {
            var retriveDevice;

            corbelDriver.iam.user('me')
            .getDevices()
            .then(function(devices) {
                expect(devices).to.have.deep.property('data.length', 0);

                return corbelDriver.iam.user('me')
                .registerDevice(deviceId, device);
            })
            .then(function() {
                return corbelDriver.iam.user('me')
                .getDevice(deviceId);
            })
            .then(function(responseDevice) {
                retriveDevice = responseDevice.data;
                ['notificationUri', 'uid', 'name', 'type', 'notificationEnabled']
                .forEach(function(key) {
                    expect(retriveDevice[key]).to.be.equals(device[key]);
                });
                device.name = 'My black device';

                return corbelDriver.iam.user('me')
                .registerDevice(deviceId, device);
            })
            .then(function() {
                retriveDevice.name = device.name;

                return corbelDriver.iam.user('me')
                .getDevices();
            })
            .then(function(responseDevices) {
                retriveDevice = responseDevices.data[0];
                    corbelTest.common.utils.expectFieldsToBeEquals(deviceFields, retriveDevice, device);

                    return corbelDriver.iam.user('me')
                        .deleteDevice(retriveDevice.id);
            })
            .then(function() {
                return corbelDriver.iam.user('me')
                .getDevices();
            })
            .then(function(devices) {
                expect(devices).to.have.deep.property('data.length', 0);
            })
            .should.notify(done);
        });
    });
});
