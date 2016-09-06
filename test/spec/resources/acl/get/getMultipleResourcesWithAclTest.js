describe('In RESOURCES module', function() {

    describe('In ACL module', function() {

        describe('while trying to get multiple resources from a collection', function() {
            var corbelRootDriver;
            var corbelAdminDriver;
            var corbelDriver;
            var COLLECTION_NAME;
            var DOMAIN = 'silkroad-qa';
            var adminUser;
            var user;
            var random;
            var usersId;
            var amount = 5;
            var aclConfigurationId;

            beforeEach(function(done) {
                COLLECTION_NAME = 'test:testAcl' + Date.now();
                corbelRootDriver = corbelTest.drivers['ADMIN_USER'].clone();
                corbelAdminDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                random = Date.now();
                usersId = [];

                corbelTest.common.resources.setManagedCollection(
                    corbelRootDriver, DOMAIN, COLLECTION_NAME)
                .should.be.fulfilled
                .then(function(id) {
                    aclConfigurationId = id;
                    return corbelTest.common.iam.createUsers(corbelAdminDriver, 1)
                    .should.be.fulfilled;
                })
                .then(function(createdUser) {
                    adminUser = createdUser[0];
                    usersId.push(adminUser.id);

                    return corbelTest.common.iam.createUsers(corbelDriver, 1)
                    .should.be.fulfilled;
                })
                .then(function(createdUser) {
                    user = createdUser[0];
                    usersId.push(user.id);

                    return corbelTest.common.clients.loginUser
                        (corbelAdminDriver, adminUser.username, adminUser.password)
                    .should.be.fulfilled;
                })
                .then(function(){
                    return corbelTest.common.clients.loginUser
                        (corbelDriver, user.username, user.password)
                    .should.be.fulfilled;
                })
                .then(function(){
                    return corbelTest.common.resources.createdObjectsToQuery(corbelAdminDriver, COLLECTION_NAME, amount)
                    .should.be.fulfilled;
                })
                .should.notify(done);
            });

            afterEach(function(done) {

                corbelTest.common.resources.unsetManagedCollection(
                    corbelRootDriver, DOMAIN, COLLECTION_NAME, aclConfigurationId)
                .should.be.fulfilled
                .then(function() {
                    return corbelTest.common.resources.cleanResourcesQuery(corbelAdminDriver)
                    .should.be.fulfilled;
                })
                .then(function(){
                    var promises = usersId.map(function(userId){
                        return corbelRootDriver.iam.user(userId)
                            .delete()
                        .should.be.fulfilled;
                    });

                    return Promise.all(promises);
                })
                .should.notify(done);
            });

            it('the resources can be gotten if the user has ADMIN permission', function(done) {
                corbelAdminDriver.resources.collection(COLLECTION_NAME)
                    .get()
                .should.be.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount);
                    response.data.map(function(resource){
                        expect(resource).to.have.property('_acl');
                    });
                })
                .should.notify(done);
            });

            it('the user can only access to the resources in which he has permissions', function(done) {
                var resourceId;
                var ACL = {};
                var TEST_OBJECT = {
                    test: 'test' + random,
                    test2: 'test2' + random
                };

                corbelDriver.resources.collection(COLLECTION_NAME)
                    .add(TEST_OBJECT)
                .should.be.fulfilled
                .then(function(id) {
                    resourceId = id;
                    ACL['user:' + user.id] = {
                        permission : 'ADMIN'
                    };
                    ACL['user:' + adminUser.id] = {
                        permission : 'ADMIN'
                    };

                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .update(ACL, {dataType: 'application/corbel.acl+json'})
                    .should.be.fulfilled;
                })
                .then(function() {
                    return corbelAdminDriver.resources.collection(COLLECTION_NAME)
                        .get()
                    .should.be.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount + 1);
                    response.data.map(function(resource){
                        expect(resource).to.have.property('_acl');
                    });

                    return corbelDriver.resources.collection(COLLECTION_NAME)
                        .get()
                    .should.be.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 1);
                    response.data.map(function(resource){
                        expect(resource).to.have.property('_acl');
                    });

                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .delete()
                    .should.be.fulfilled;
                })
                .should.notify(done);
            });

            it('the resources can be gotten if the user has ADMIN permission and uses a query', function(done) {
                var params = {
                    query: [{
                        '$eq': {
                            stringField: 'stringFieldContent1'
                        }
                    }]
                };

                corbelAdminDriver.resources.collection(COLLECTION_NAME)
                    .get(params)
                .should.be.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 1);
                    expect(response).to.have.deep.property('data[0].stringField', 'stringFieldContent1');
                })
                .should.notify(done);
            });
        });
    });
});
