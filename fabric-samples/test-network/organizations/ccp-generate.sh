#!/usr/bin/env bash

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        organizations/ccp-template.json
}

function yaml_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        organizations/ccp-template.yaml | sed -e $'s/\\\\n/\\\n          /g'
}

generate_ccp() {
  ORG=$1
  P0PORT=$2
  CAPORT=$3
  ORG_DOMAIN=$4

  PEERPEM=organizations/peerOrganizations/${ORG_DOMAIN}/tlsca/tlsca.${ORG_DOMAIN}-cert.pem
  CAPEM=organizations/peerOrganizations/${ORG_DOMAIN}/ca/ca.${ORG_DOMAIN}-cert.pem

  echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/${ORG_DOMAIN}/connection-org${ORG}.json
  echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/${ORG_DOMAIN}/connection-org${ORG}.yaml
}

generate_ccp 1 7051 7054 hospitaladmin.example.com
generate_ccp 2 8051 8054 clinicalstaff.example.com
generate_ccp 3 9051 9054 diagnosticstaff.example.com
generate_ccp 4 10051 10054 pharmacy.example.com
generate_ccp 5 11051 11054 insurance.example.com
generate_ccp 6 12051 12054 patientaccess.example.com
