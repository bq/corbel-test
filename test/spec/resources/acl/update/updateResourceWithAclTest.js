describe('In RESOURCES module', function() {

    describe('In ACL module', function() {

        describe('while testing update resources', function() {
            var corbelDriver;
            var corbelAdminDriver;
            var corbelRootDriver;
            var COLLECTION_NAME = 'test:testAcl' + Date.now();
            var DOMAIN = 'silkroad-qa';
            var user;
            var adminUser;
            var resourceId;
            var random;
            var usersId;
            var groupId;
            var TEST_OBJECT;
            var TEST_OBJECT_UPDATE;
            var dataType;

            before(function(done) {
                corbelRootDriver = corbelTest.drivers['ADMIN_USER'].clone();

                var corbelUserDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                var user;
                
                corbelTest.common.iam.createUsers(corbelRootDriver, 1)
                .should.be.eventually.fulfilled
                .then(function(createdUsers) {
                    user = createdUsers[0];

                    return corbelTest.common.clients
                    .loginUser(corbelUserDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelTest.common.resources.setManagedCollection(
                        corbelRootDriver, corbelUserDriver, corbelTest.common.utils.retryFail,
                        DOMAIN, COLLECTION_NAME)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelRootDriver.iam.user(user).delete()
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });

            after(function(done) {
                var corbelUserDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                var user;

                corbelTest.common.iam.createUsers(corbelRootDriver, 1)
                .should.be.eventually.fulfilled
                .then(function(createdUsers) {
                    user = createdUsers[0];

                    return corbelTest.common.clients
                    .loginUser(corbelUserDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelTest.common.resources.unsetAndDeleteManagedCollection(
                        corbelRootDriver, corbelUserDriver, corbelTest.common.utils.retry,
                        DOMAIN, COLLECTION_NAME)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelRootDriver.iam.user(user).delete()
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });

            beforeEach(function(done) {
                corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                corbelAdminDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                random = Date.now();
                usersId = [];
                groupId = 'testGroup' + random;
                dataType = {dataType: 'application/json'};
                TEST_OBJECT = {
                    test: 'test' + random,
                    test2: 'test2' + random
                };
                TEST_OBJECT_UPDATE = {
                    test: 'testUpdate' + random,
                    test2: 'test2Update' + random
                };

                corbelTest.common.iam.createUsers(corbelAdminDriver, 1)
                .should.be.eventually.fulfilled
                .then(function(createdUser) {
                    adminUser = createdUser[0];
                    usersId.push(adminUser.id);

                    return corbelTest.common.iam.createUsers(corbelDriver, 1, {'groups': [groupId]})
                    .should.be.eventually.fulfilled;
                })
                .then(function(createdUser){
                    user = createdUser[0];
                    usersId.push(user.id);

                    return corbelTest.common.clients.loginUser
                        (corbelAdminDriver, adminUser.username, adminUser.password)
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });

            afterEach(function(done) {
                
                corbelTest.common.clients.loginUser
                    (corbelAdminDriver, adminUser.username, adminUser.password)
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .delete(dataType)
                    .should.be.eventually.fulfilled;
                })
                .then(function(){
                    var promises = usersId.map(function(userId){
                        return corbelRootDriver.iam.user(userId)
                            .delete()
                        .should.be.eventually.fulfilled;
                    });

                    return Promise.all(promises);
                })
                .should.notify(done);
            });

            it('a resource is created when update a non existent resource.', function(done) {
                resourceId = random;

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(TEST_OBJECT)
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data._acl.user:' + adminUser.id + '.permission','ADMIN');
                    expect(response).to.have.deep.property('data.test', 'test' + random);
                    expect(response).to.have.deep.property('data.test2', 'test2' + random);
                })
                .should.notify(done);
            });

            it('a resource with ACL can be updated if the user has ADMIN permission', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] = {
                    permission : 'ADMIN'
                };
                ACL['user:' + user.id] = {
                    permission : 'ADMIN'
                };

                corbelAdminDriver.resources.collection(COLLECTION_NAME)
                    .add(TEST_OBJECT)
                .should.be.eventually.fulfilled
                .then(function(id) {
                    resourceId = id;

                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .update(ACL, {dataType: 'application/corbel.acl+json'})
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelTest.common.clients.loginUser
                        (corbelDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .update(TEST_OBJECT_UPDATE)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.test', 'testUpdate' + random);
                    expect(response).to.have.deep.property('data.test2', 'test2Update' + random);
                })
                .should.notify(done);
            });

            it('a resource with ACL can be updated if the users group has ADMIN permission', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] = {
                    permission : 'ADMIN'
                };
                ACL['group:' + groupId] = {
                    permission : 'ADMIN'
                };

                corbelAdminDriver.resources.collection(COLLECTION_NAME)
                    .add(TEST_OBJECT)
                .should.be.eventually.fulfilled
                .then(function(id) {
                    resourceId = id;

                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .update(ACL, {dataType: 'application/corbel.acl+json'})
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelTest.common.clients.loginUser
                        (corbelDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .update(TEST_OBJECT_UPDATE)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.test', 'testUpdate' + random);
                    expect(response).to.have.deep.property('data.test2', 'test2Update' + random);
                })
                .should.notify(done);
            });

            it('a resource with ACL can be updated if the user has WRITE permission', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] = {
                    permission : 'ADMIN'
                };
                ACL['user:' + user.id] = {
                    permission : 'WRITE'
                };

                corbelAdminDriver.resources.collection(COLLECTION_NAME)
                    .add(TEST_OBJECT)
                .should.be.eventually.fulfilled
                .then(function(id) {
                    resourceId = id;

                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .update(ACL, {dataType: 'application/corbel.acl+json'})
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelTest.common.clients.loginUser
                        (corbelDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .update(TEST_OBJECT_UPDATE)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.test', 'testUpdate' + random);
                    expect(response).to.have.deep.property('data.test2', 'test2Update' + random);
                })
                .should.notify(done);
            });

            it('a resource with ACL can be updated if the users group has WRITE permission', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] = {
                    permission : 'ADMIN'
                };
                ACL['group:' + groupId] = {
                    permission : 'WRITE'
                };

                corbelAdminDriver.resources.collection(COLLECTION_NAME)
                    .add(TEST_OBJECT)
                .should.be.eventually.fulfilled
                .then(function(id) {
                    resourceId = id;

                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .update(ACL, {dataType: 'application/corbel.acl+json'})
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelTest.common.clients.loginUser
                        (corbelDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .update(TEST_OBJECT_UPDATE)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.test', 'testUpdate' + random);
                    expect(response).to.have.deep.property('data.test2', 'test2Update' + random);
                })
                .should.notify(done);
            });

            it('a resource with ACL can be updated with ADMIN permission for ALL users', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] = {
                    permission : 'ADMIN'
                };
                ACL.ALL = {
                    permission : 'ADMIN'
                };

                corbelAdminDriver.resources.collection(COLLECTION_NAME)
                    .add(TEST_OBJECT)
                .should.be.eventually.fulfilled
                .then(function(id) {
                    resourceId = id;

                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .update(ACL, {dataType: 'application/corbel.acl+json'})
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelTest.common.clients.loginUser
                        (corbelDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .update(TEST_OBJECT_UPDATE)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.test', 'testUpdate' + random);
                    expect(response).to.have.deep.property('data.test2', 'test2Update' + random);
                })
                .should.notify(done);
            });

            it('a resource with ACL can be updated with WRITE permission for ALL users', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] = {
                    permission : 'ADMIN'
                };
                ACL.ALL = {
                    permission : 'WRITE'
                };

                corbelAdminDriver.resources.collection(COLLECTION_NAME)
                    .add(TEST_OBJECT)
                .should.be.eventually.fulfilled
                .then(function(id) {
                    resourceId = id;

                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .update(ACL, {dataType: 'application/corbel.acl+json'})
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelTest.common.clients.loginUser
                        (corbelDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .update(TEST_OBJECT_UPDATE)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.test', 'testUpdate' + random);
                    expect(response).to.have.deep.property('data.test2', 'test2Update' + random);
                })
                .should.notify(done);
            });

            it('a resource not json can be updated with ACL.', function(done) {
                var FILE_CONTENT = 'this Is My fileee!!! ññáaäéó' + random;
                var FILE_CONTENT_UPDATE = 'this Is My fileee!!! ññáaäéó ---UPDATED' + random;
                dataType = {dataType: 'application/xml'};

                corbelAdminDriver.resources.collection(COLLECTION_NAME)
                    .add(FILE_CONTENT, dataType)
                .should.be.eventually.fulfilled
                .then(function(id) {
                    resourceId = id;

                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get(dataType)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.property('data', FILE_CONTENT);

                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .update(FILE_CONTENT_UPDATE, dataType)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get(dataType)
                    .should.be.eventually.fulfilled;
                }).
                then(function(response) {
                    expect(response).to.have.property('data', FILE_CONTENT_UPDATE);
                })
                .should.notify(done);
            });
        });
    });
});
