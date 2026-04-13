# MongoDB Atlas Setup Guide - Tarcom

## Étape 1 : Créer un compte MongoDB Atlas

1. Allez sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Cliquez sur "Sign Up"
3. Créez un compte avec votre email
4. Vérifiez votre email

## Étape 2 : Créer un Cluster

1. Sur le dashboard, cliquez sur "Create a Deployment"
2. Sélectionnez **"Shared"** (gratuit - 512MB)
3. Choisissez votre région (recommandé : Europe - Frankfurt)
4. Cliquez "Create Deployment"
5. Attendez 3-5 minutes pour la création

## Étape 3 : Configurer l'accès

### Créer un utilisateur de base de données

1. Dans le panel gauche, cliquez sur "Database Access"
2. Cliquez "Add New Database User"
3. Remplissez :
   - **Username** : `tarcom_user`
   - **Password** : Générez un password fort (sauvegardez-le !)
4. **Permissions** : Sélectionnez "Built-in Role" → "Atlas Admin"
5. Cliquez "Add User"

### Configurer l'accès réseau

1. Dans le panel gauche, cliquez sur "Network Access"
2. Cliquez "Add IP Address"
3. Sélectionnez "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ Pour production, utilisez uniquement vos IPs
4. Cliquez "Confirm"

## Étape 4 : Obtenir la chaîne de connexion

1. Allez dans "Databases" → Votre cluster
2. Cliquez "Connect"
3. Sélectionnez "Connect your application"
4. Choisissez "Java" comme driver
5. Copiez la chaîne de connexion
   ```
   mongodb+srv://tarcom_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Remplacez `<password>` par votre password

## Étape 5 : Configuration Spring Boot

### Fichier `application.properties`

```properties
spring.data.mongodb.uri=mongodb+srv://tarcom_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/tarcom?retryWrites=true&w=majority
spring.data.mongodb.database=tarcom
spring.data.mongodb.auto-index-creation=true
```

### Fichier `application.yml` (alternative)

```yaml
spring:
  data:
    mongodb:
      uri: mongodb+srv://tarcom_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/tarcom?retryWrites=true&w=majority
      database: tarcom
      auto-index-creation: true
```

## Étape 6 : Ajouter les dépendances Maven

Dans `pom.xml` :

```xml
<!-- MongoDB -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-mongodb</artifactId>
</dependency>

<!-- GridFS pour les fichiers -->
<dependency>
    <groupId>org.springframework.data</groupId>
    <artifactId>spring-data-mongodb</artifactId>
</dependency>

<!-- Multipart upload -->
<dependency>
    <groupId>commons-io</groupId>
    <artifactId>commons-io</artifactId>
    <version>2.11.0</version>
</dependency>
```

## Étape 7 : Vérifier la connexion

Lancez votre application Spring Boot :

```bash
./mvnw spring-boot:run
```

Vous devriez voir :
```
Opened connection class org.mongodb.connection.SocketStreamHelper
```

## Collections créées automatiquement

Les collections suivantes seront créées :
- `submissions` - Les dossiers soumis
- `fiche_renseignements` - Les fiches (optionnel)
- `documents` - Métadonnées des fichiers (GridFS)
- `fs.files` - Fichiers (GridFS)
- `fs.chunks` - Chunks de fichiers (GridFS)

## Dépannage

### Erreur : "Authentication failed"
- Vérifiez le username/password
- Vérifiez que l'utilisateur DB est créé
- Vérifiez l'IP whitelist

### Erreur : "Connection refused"
- Vérifiez votre connexion internet
- Vérifiez que MongoDB Atlas est accessible
- Attendez 2-3 minutes après la création du cluster

### Erreur : "Database not found"
- C'est normal, elle sera créée à la première sauvegarde

## Prochaines étapes

1. Créer les modèles JPA (voir `DATABASE_SCHEMA.md`)
2. Créer les repositories MongoDB
3. Implémenter les endpoints REST
4. Connecter le frontend Next.js
