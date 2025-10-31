import "../stylesheets/infopage.css";

function InfoPage() {
  return (
    <div className="information-page">
      <h1>Informations sur les bornes de recharge</h1>

      <section>
        <h2>Qu'est-ce qu'une borne de recharge ?</h2>
        <p>
          Une borne de recharge est un équipement électrique permettant de
          recharger la batterie d'un véhicule électrique. On les trouve dans les
          parkings publics, les centres commerciaux, en voirie ou encore chez
          les particuliers. Elles peuvent offrir différentes puissances selon
          les besoins des utilisateurs.
        </p>
      </section>

      <section>
        <h2>Types de bornes</h2>
        <p>Il existe plusieurs types de bornes :</p>
        <ul>
          <li>
            <strong>Standard (3 à 7 kW)</strong> : adaptées à la recharge lente,
            souvent utilisées à domicile.
          </li>
          <li>
            <strong>Accélérées (11 à 22 kW)</strong> : idéales pour les
            recharges en ville ou au travail.
          </li>
          <li>
            <strong>Rapides (43 kW et +)</strong> : permettent de recharger
            jusqu'à 80% en 30 minutes. On les retrouve sur les autoroutes ou
            grands axes.
          </li>
        </ul>
      </section>

      <section>
        <h2>Tarification</h2>
        <p>La recharge peut être :</p>
        <ul>
          <li>
            <strong>Gratuite</strong>, proposée par certains commerces pour
            attirer des clients.
          </li>
          <li>
            <strong>Payante</strong>, selon un tarif au kWh, à la durée ou un
            forfait. Les prix varient selon l'opérateur.
          </li>
        </ul>
      </section>

      <section>
        <h2>Localisation et accessibilité</h2>
        <p>
          La disponibilité des bornes dépend de la localisation. Certaines zones
          sont très bien équipées, tandis que d'autres restent peu couvertes.
          L'accessibilité 24h/24 n'est pas toujours garantie. Il est recommandé
          de vérifier en amont si la borne est
          <strong> libre</strong>, <strong>en panne</strong> ou{" "}
          <strong>réservée</strong>.
        </p>
      </section>

      <section>
        <h2>Compatibilité et connectique</h2>
        <p>
          Toutes les bornes ne sont pas compatibles avec tous les véhicules. Les
          connecteurs les plus courants en Europe sont :
        </p>
        <ul>
          <li>
            <strong>Type 2 (Mennekes)</strong> : norme européenne pour la
            recharge AC.
          </li>
          <li>
            <strong>CCS Combo</strong> : pour la recharge rapide DC.
          </li>
          <li>
            <strong>CHAdeMO</strong> : surtout utilisé par Nissan et Mitsubishi.
          </li>
        </ul>
      </section>

      <section>
        <h2>Bonnes pratiques</h2>
        <ul>
          <li>Ne bloquez pas une borne inutilement après recharge.</li>
          <li>
            Utilisez l'application pour signaler les pannes ou vérifier les
            infos en temps réel.
          </li>
        </ul>
      </section>
    </div>
  );
}

export default InfoPage;
