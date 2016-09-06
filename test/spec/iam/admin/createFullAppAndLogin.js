describe('In IAM module', function() {

    describe('domain management allows create full appplication with', function() {
        var corbelRootDriver;
        var corbelDriver;
        var corbelUserDriver;

        before(function() {
            corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
            corbelDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();
        });


        it('a domain can be created and deleted', function(done) {
            var domain = {
                id: 'newApp_' + Date.now(),
                description: 'My new app',
                scopes: ['iam:user:me', 'iam:user:create', 'iam:user:delete'],
                defaultScopes: ['iam:user:me']
            };

            corbelRootDriver.iam.domain()
            .create(domain)
            .then(function(id) {
                domain.id = id;
                return corbelRootDriver.domain(domain.id).iam.domain()
                .get();
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.id', domain.id);
                return corbelRootDriver.domain(domain.id).iam.domain()
                .remove();
            })
            .then(function() {
                return corbelRootDriver.domain(domain.id).iam.domain()
                .get()
                .should.be.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('new client can be created and deleted', function(done) {
            var domain = {
                id: 'newApp_' + Date.now(),
                description: 'My new app',
                scopes: ['iam:user:me', 'iam:user:create', 'iam:user:delete'],
                defaultScopes: ['iam:user:me']
            };

            var client = {
                name: 'client1',
                signatureAlgorithm: 'HS256',
                scopes: ['iam:user:create', 'iam:user:delete']
            };

            corbelRootDriver.iam.domain()
            .create(domain)
            .then(function(id) {
                domain.id = id;
                return corbelRootDriver.domain(domain.id).iam.client()
                .create(client);
            })
            .then(function(id){
                client.id = id;
                return corbelRootDriver.domain(domain.id).iam.client(client.id)
                .get();
            })
            .then(function(response){
                client.clientsecret = response.data.key;
                expect(response).to.have.deep.property('data.id', client.id);
            })
            .then(function(){
                return corbelRootDriver.domain(domain.id).iam.client(client.id)
                .remove();
            })
            .then(function(){
                return corbelRootDriver.domain(domain.id).iam.client(client.id)
                .get()
                .should.be.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .then(function() {
                return corbelRootDriver.domain(domain.id).iam.domain()
                .remove();
            })
            .then(function() {
                return corbelRootDriver.domain(domain.id).iam.domain()
                .get()
                .should.be.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('new user can be created, logged and deleted', function(done) {
            var userData = {
                email: 'myEmail@funkifake.com',
                username: 'new user',
                password: 'password',
                scopes: undefined
            };

            var domain = {
                id: 'newApp_' + Date.now(),
                description: 'My new app',
                scopes: ['iam:user:me', 'iam:user:create', 'iam:user:delete'],
                defaultScopes: ['iam:user:me']
            };

            var client = {
                name: 'client1',
                signatureAlgorithm: 'HS256',
                scopes: ['iam:user:create', 'iam:user:delete']
            };

            corbelRootDriver.iam.domain()
            .create(domain)
            .then(function(id) {
                domain.id = id;
                return corbelRootDriver.domain(domain.id).iam.client()
                .create(client);
            })
            .then(function(id){
                client.id = id;
                return corbelRootDriver.domain(domain.id).iam.client(client.id)
                .get();
            })
            .then(function(response){
                client.clientsecret = response.data.key;
                expect(response).to.have.deep.property('data.id', client.id);
                corbelUserDriver = corbelTest.getCustomDriver({
                    'clientId': client.id,
                    'clientSecret': client.clientsecret,
                    'scopes': client.scopes.join(' ')
                });
                return corbelUserDriver.iam.token().create();
            })
            .then(function(){
                return corbelTest.common.iam.createUsers(corbelUserDriver, 1);
            })
            .then(function(user){
                userData= user[0];
                return corbelTest.common.clients
                .loginUser(corbelUserDriver, userData.username, userData.password);
            })
            .then(function() {
                return corbelUserDriver.iam.user(userData.id)
                .delete();
            })
            .then(function() {
                return corbelRootDriver.iam.user(userData.id)
                .get()
                .should.be.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .then(function(){
                return corbelRootDriver.domain(domain.id).iam.client(client.id)
                .remove();
            })
            .then(function(){
                return corbelRootDriver.domain(domain.id).iam.client(client.id)
                .get()
                .should.be.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .then(function() {
                return corbelRootDriver.domain(domain.id).iam.domain()
                .remove();
            })
            .then(function() {
                return corbelRootDriver.domain(domain.id).iam.domain()
                .get()
                .should.be.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });
    });
});
